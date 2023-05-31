import { MarkdownRenderChild, TFile } from 'obsidian';
import MetaBindPlugin from './main';
import { AbstractInputField } from './inputFields/AbstractInputField';
import { InputFieldFactory } from './inputFields/InputFieldFactory';
import { InputFieldArgumentType, InputFieldDeclaration, InputFieldType } from './parsers/InputFieldDeclarationParser';
import { AbstractInputFieldArgument } from './inputFieldArguments/AbstractInputFieldArgument';
import { ClassInputFieldArgument } from './inputFieldArguments/ClassInputFieldArgument';
import {MetaBindBindTargetError, MetaBindExpressionError, MetaBindInternalError} from './utils/MetaBindErrors';
import { MetadataFileCache } from './MetadataManager';
import { parsePath, traverseObjectByPath } from '@opd-libs/opd-utils-lib/lib/ObjectTraversalUtils';
import { ShowcaseInputFieldArgument } from './inputFieldArguments/ShowcaseInputFieldArgument';
import { TitleInputFieldArgument } from './inputFieldArguments/TitleInputFieldArgument';
import { isTruthy } from './utils/Utils';
import { Listener, Signal } from './utils/Signal';
import {RenderChildType} from './InputFieldMarkdownRenderChild';
import {ViewFieldDeclaration} from './parsers/ViewFieldDeclarationParser';
import {BindTargetDeclaration} from './parsers/BindTargetParser';
import {ViewField} from './viewFields/ViewField';
import * as MathJs from 'mathjs';

export interface ViewFieldVariable {
	bindTargetDeclaration: BindTargetDeclaration,
	writeSignal: Signal<any>,
	uuid: string,
	metadataCache: MetadataFileCache | undefined;
	writeSignalListener: Listener<any> | undefined;
	contextName: string | undefined;
}

export class ViewFieldMarkdownRenderChild extends MarkdownRenderChild {
	plugin: MetaBindPlugin;
	filePath: string;
	uuid: string;
	viewField: ViewField;
	error: string;
	renderChildType: RenderChildType;

	fullDeclaration?: string;
	expressionStr?: string;
	expression?: MathJs.EvalFunction;
	viewFieldDeclaration: ViewFieldDeclaration;
	variables: ViewFieldVariable[];
	private metadataManagerReadSignalListener: Listener<any> | undefined;

	constructor(containerEl: HTMLElement, renderChildType: RenderChildType, declaration: ViewFieldDeclaration, plugin: MetaBindPlugin, filePath: string, uuid: string) {
		super(containerEl);

		if (!declaration.error) {
			this.error = '';
		} else {
			this.error = declaration.error instanceof Error ? declaration.error.message : declaration.error;
		}

		this.filePath = filePath;
		this.uuid = uuid;
		this.viewField = new ViewField(this);
		this.plugin = plugin;
		this.renderChildType = renderChildType;
		this.fullDeclaration = declaration.fullDeclaration;
		this.viewFieldDeclaration = declaration;
		this.variables = [];

		if (!this.error) {
			try {
				for (const bindTarget of this.viewFieldDeclaration.bindTargets ?? []) {
					this.variables.push({
						bindTargetDeclaration: this.plugin.api.bindTargetParser.parseBindTarget(bindTarget, this.filePath),
						writeSignal: new Signal<any>(undefined),
						uuid: self.crypto.randomUUID(),
						metadataCache: undefined,
						writeSignalListener: undefined,
						contextName: undefined,
					});
				}

				this.parseExpression();
			} catch (e: any) {
				this.error = e.message;
				console.warn(e);
			}
		}
	}

	parseExpression() {
		const declaration = this.viewFieldDeclaration.declaration ?? "";
		let varCounter = 0;

		this.expressionStr = declaration.replace(/{.*?}/g, (substring: string): string => {
			// remove braces and leading and trailing spaces
			substring = substring.substring(1, substring.length - 1).trim();
			// replace by variable name;
			for (const variable of this.variables) {
				if (variable.bindTargetDeclaration.metadataFieldName === substring) {
					let varName = `MB_VAR_${varCounter}`;
					variable.contextName = varName;
					varCounter += 1;
					return varName;
				}
			}

			// this should be unreachable
			return "MB_VAR_NOT_FOUND";
		});

		this.expression = MathJs.compile(this.expressionStr);
	}

	buildContext(): Record<string, any> {
		const context: Record<string, any> = {};
		for (const variable of this.variables ?? []) {
			if (!variable.contextName || !variable.writeSignal) {
				continue;
			}

			context[variable.contextName] = variable.writeSignal.get() ?? "";
		}

		return context;
	}

	evaluateExpression(): string {
		if (!this.expression) {
			throw new Error("Can't evaluate expression. Expression is undefined.")
		}

		const context = this.buildContext();
		try {
			return this.expression.evaluate(context);
		} catch (e: any) {
			console.warn(new MetaBindExpressionError(`failed to evaluate expression`), {
				declaration: this.viewFieldDeclaration.declaration,
				expression: this.expressionStr,
				context: context,
			});
			throw new MetaBindExpressionError(`failed to evaluate expression "${this.viewFieldDeclaration.declaration}" with reason: ${e.message}`)
		}
	}

	registerSelfToMetadataManager(): void {
		for (const variable of this.variables) {
			variable.writeSignalListener = variable.writeSignal.registerListener({
				callback: () => {
					this.viewField.update();
				}
			});

			variable.metadataCache = this.plugin.metadataManager.register(
				variable.bindTargetDeclaration.file,
				variable.writeSignal,
				variable.bindTargetDeclaration.metadataPath,
				this.uuid + "/" + variable.uuid,
			);
		}
	}

	unregisterSelfFromMetadataManager(): void {
		for (const variable of this.variables) {
			if (variable.writeSignalListener) {
				variable.writeSignal.unregisterListener(variable.writeSignalListener);
			}
			this.plugin.metadataManager.unregister(
				variable.bindTargetDeclaration.file,
				this.uuid + "/" + variable.uuid,
			);
		}
	}

	getInitialValue(): string {
		return ""
	}

	async onload(): Promise<void> {
		console.log('meta-bind | ViewFieldMarkdownRenderChild >> load', this);

		this.containerEl.addClass('meta-bind-plugin-view');

		const container: HTMLDivElement = createDiv();
		container.addClass('meta-bind-plugin-view-wrapper');

		if (this.error) {
			this.renderError(this.error);
			return;
		}

		this.registerSelfToMetadataManager();

		this.plugin.registerViewFieldMarkdownRenderChild(this);

		// TODO: render into `container`
		this.viewField.render(container);

		this.containerEl.empty();
		this.containerEl.appendChild(container);
	}

	renderError(message: string): void {
		this.containerEl.empty();

		this.containerEl.createEl('code', { text: ` ${this.fullDeclaration}` });
		this.containerEl.createEl('code', { text: `-> ${message}`, cls: 'meta-bind-plugin-error' });
	}

	onunload(): void {
		console.log('meta-bind | ViewFieldMarkdownRenderChild >> unload', this);

		this.plugin.unregisterViewFieldMarkdownRenderChild(this);
		this.unregisterSelfFromMetadataManager();

		this.containerEl.empty();
		this.containerEl.createEl('span', { text: 'unloaded meta bind view field', cls: 'meta-bind-plugin-error' });

		super.onunload();
	}
}

import { ErrorLevel, MetaBindExpressionError } from '../utils/errors/MetaBindErrors';
import { Listener, Signal } from '../utils/Signal';
import { RenderChildType } from './InputFieldMDRC';
import { ViewFieldDeclaration } from '../parsers/ViewFieldDeclarationParser';
import { BindTargetDeclaration } from '../parsers/BindTargetParser';
import { ViewField } from '../viewFields/ViewField';
import * as MathJs from 'mathjs';
import { AbstractViewFieldMDRC } from './AbstractViewFieldMDRC';
import { IPlugin } from '../IPlugin';
import MetaBindPlugin from '../main';
import { MetadataFileCache } from '../metadata/MetadataFileCache';

export interface ViewFieldVariable {
	bindTargetDeclaration: BindTargetDeclaration;
	writeSignal: Signal<any>;
	uuid: string;
	metadataCache: MetadataFileCache | undefined;
	writeSignalListener: Listener<any> | undefined;
	contextName: string | undefined;
}

export class ViewFieldMDRC extends AbstractViewFieldMDRC {
	viewField: ViewField;

	fullDeclaration?: string;
	expressionStr?: string;
	expression?: MathJs.EvalFunction;
	viewFieldDeclaration: ViewFieldDeclaration;
	variables: ViewFieldVariable[];
	private metadataManagerReadSignalListener: Listener<any> | undefined;

	constructor(
		containerEl: HTMLElement,
		renderChildType: RenderChildType,
		declaration: ViewFieldDeclaration,
		plugin: MetaBindPlugin,
		filePath: string,
		uuid: string,
		frontmatter: any | null | undefined = undefined
	) {
		super(containerEl, renderChildType, plugin, filePath, uuid, frontmatter);

		this.errorCollection.merge(declaration.errorCollection);

		this.viewField = new ViewField(this);
		this.fullDeclaration = declaration.fullDeclaration;
		this.viewFieldDeclaration = declaration;
		this.variables = [];

		if (this.errorCollection.isEmpty()) {
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
			} catch (e) {
				this.errorCollection.add(e);
			}
		}
	}

	parseExpression() {
		const declaration = this.viewFieldDeclaration.declaration ?? '';
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
			return 'MB_VAR_NOT_FOUND';
		});

		this.expression = MathJs.compile(this.expressionStr);
	}

	buildContext(): Record<string, any> {
		const context: Record<string, any> = {};
		for (const variable of this.variables ?? []) {
			if (!variable.contextName || !variable.writeSignal) {
				continue;
			}

			context[variable.contextName] = variable.writeSignal.get() ?? '';
		}

		return context;
	}

	async evaluateExpression(): Promise<string> {
		if (!this.expression) {
			throw new MetaBindExpressionError(ErrorLevel.ERROR, 'failed to evaluate expression', 'expression is undefined');
		}

		const context = this.buildContext();
		try {
			return this.expression.evaluate(context);
		} catch (e: any) {
			throw new MetaBindExpressionError(ErrorLevel.ERROR, `failed to evaluate expression`, e, {
				declaration: this.viewFieldDeclaration.declaration,
				expression: this.expressionStr,
				context: context,
			});
		}
	}

	registerSelfToMetadataManager(): void {
		for (const variable of this.variables) {
			variable.writeSignalListener = variable.writeSignal.registerListener({
				callback: () => {
					this.viewField.update();
				},
			});

			variable.metadataCache = this.plugin.metadataManager.register(
				variable.bindTargetDeclaration.filePath,
				this.frontmatter,
				variable.writeSignal,
				variable.bindTargetDeclaration.metadataPath,
				this.uuid + '/' + variable.uuid
			);
		}
	}

	unregisterSelfFromMetadataManager(): void {
		for (const variable of this.variables) {
			if (variable.writeSignalListener) {
				variable.writeSignal.unregisterListener(variable.writeSignalListener);
			}
			this.plugin.metadataManager.unregister(variable.bindTargetDeclaration.filePath, this.uuid + '/' + variable.uuid);
		}
	}

	getInitialValue(): string {
		return '';
	}

	async onload(): Promise<void> {
		console.log('meta-bind | ViewFieldMarkdownRenderChild >> load', this);

		this.containerEl.addClass('meta-bind-plugin-view');

		const container: HTMLDivElement = createDiv();
		container.addClass('meta-bind-plugin-view-wrapper');

		this.errorCollection.render(this.containerEl);
		if (this.errorCollection.hasErrors()) {
			return;
		}

		this.registerSelfToMetadataManager();

		this.plugin.mdrcManager.registerMDRC(this);

		// TODO: render into `container`
		this.viewField.render(container);

		this.containerEl.empty();
		this.containerEl.appendChild(container);
	}

	onunload(): void {
		console.log('meta-bind | ViewFieldMarkdownRenderChild >> unload', this);

		this.plugin.mdrcManager.unregisterMDRC(this);
		this.unregisterSelfFromMetadataManager();

		this.containerEl.empty();
		this.containerEl.createEl('span', { text: 'unloaded meta bind view field', cls: 'meta-bind-plugin-error' });

		super.onunload();
	}
}

import { ErrorLevel, MetaBindExpressionError } from '../utils/errors/MetaBindErrors';
import { Listener, Signal } from '../utils/Signal';
import { RenderChildType } from './InputFieldMDRC';
import { ViewFieldDeclaration } from '../parsers/ViewFieldDeclarationParser';
import { ViewField } from '../viewFields/ViewField';
import * as MathJs from 'mathjs';
import { AbstractViewFieldMDRC } from './AbstractViewFieldMDRC';
import MetaBindPlugin from '../main';
import { MetadataFileCache } from '../metadata/MetadataFileCache';
import ErrorIndicatorComponent from '../utils/errors/ErrorIndicatorComponent.svelte';
import { BindTargetDeclaration } from '../parsers/inputFieldParser/InputFieldDeclaration';

export interface ViewFieldVariable {
	bindTargetDeclaration: BindTargetDeclaration;
	writeSignal: Signal<any>;
	uuid: string;
	writeSignalListener: Listener<any> | undefined;
	contextName: string | undefined;
	listenToChildren: boolean;
}

export class ViewFieldMDRC extends AbstractViewFieldMDRC {
	viewField: ViewField;

	fullDeclaration?: string;
	expressionStr?: string;
	expression?: MathJs.EvalFunction;
	viewFieldDeclaration: ViewFieldDeclaration;
	variables: ViewFieldVariable[];

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
				let varCounter = 0;
				this.expressionStr = '';

				for (const entry of this.viewFieldDeclaration.declaration ?? []) {
					if (typeof entry !== 'string') {
						const variable = {
							bindTargetDeclaration: entry,
							writeSignal: new Signal<any>(undefined),
							uuid: self.crypto.randomUUID(),
							metadataCache: undefined,
							writeSignalListener: undefined,
							contextName: `MB_VAR_${varCounter}`,
							listenToChildren: false,
						};

						this.variables.push(variable);
						this.expressionStr += variable.contextName;
						varCounter += 1;
					} else {
						this.expressionStr += entry;
					}
				}

				this.expression = MathJs.compile(this.expressionStr);
			} catch (e) {
				this.errorCollection.add(e);
			}
		}
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

			this.plugin.metadataManager.register(
				variable.bindTargetDeclaration.filePath ?? this.filePath,
				variable.writeSignal,
				variable.bindTargetDeclaration.metadataPath,
				variable.listenToChildren,
				this.uuid + '/' + variable.uuid
			);
		}
	}

	unregisterSelfFromMetadataManager(): void {
		for (const variable of this.variables) {
			if (variable.writeSignalListener) {
				variable.writeSignal.unregisterListener(variable.writeSignalListener);
			}
			this.plugin.metadataManager.unregister(variable.bindTargetDeclaration.filePath ?? this.filePath, this.uuid + '/' + variable.uuid);
		}
	}

	getInitialValue(): string {
		return '';
	}

	async onload(): Promise<void> {
		console.log('meta-bind | ViewFieldMarkdownRenderChild >> load', this);

		this.containerEl.addClass('meta-bind-plugin-view');
		this.containerEl.empty();

		new ErrorIndicatorComponent({
			target: this.containerEl,
			props: {
				app: this.plugin.app,
				errorCollection: this.errorCollection,
				declaration: this.fullDeclaration,
			},
		});
		if (this.errorCollection.hasErrors()) {
			return;
		}

		this.registerSelfToMetadataManager();
		this.plugin.mdrcManager.registerMDRC(this);

		const container: HTMLDivElement = createDiv();
		container.addClass('meta-bind-plugin-view-wrapper');

		this.viewField.render(container);

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

import MetaBindPlugin from '../main';
import { MetaBindExpressionError } from '../utils/MetaBindErrors';
import { Listener, Signal } from '../utils/Signal';
import { RenderChildType } from './InputFieldMDRC';
import { JsViewFieldDeclaration } from '../parsers/ViewFieldDeclarationParser';
import { ViewField } from '../viewFields/ViewField';
import { ViewFieldVariable } from './ViewFieldMDRC';
import { getAPI } from 'obsidian-dataview';
import { AbstractViewFieldMDRC } from './AbstractViewFieldMDRC';

export class JsViewFieldMDRC extends AbstractViewFieldMDRC {
	viewField: ViewField;

	fullDeclaration?: string;
	// user code function
	expression?: any;
	viewFieldDeclaration: JsViewFieldDeclaration;
	variables: ViewFieldVariable[];
	private metadataManagerReadSignalListener: Listener<any> | undefined;

	constructor(containerEl: HTMLElement, renderChildType: RenderChildType, declaration: JsViewFieldDeclaration, plugin: MetaBindPlugin, filePath: string, uuid: string) {
		super(containerEl, renderChildType, plugin, filePath, uuid);

		if (!declaration.error) {
			this.error = '';
		} else {
			this.error = declaration.error instanceof Error ? declaration.error.message : declaration.error;
		}

		this.viewField = new ViewField(this);
		this.fullDeclaration = declaration.fullDeclaration;
		this.viewFieldDeclaration = declaration;
		this.variables = [];

		if (!this.error) {
			try {
				for (const bindTarget of this.viewFieldDeclaration.bindTargets ?? []) {
					this.variables.push({
						bindTargetDeclaration: this.plugin.api.bindTargetParser.parseBindTarget(bindTarget.bindTarget, this.filePath),
						writeSignal: new Signal<any>(undefined),
						uuid: self.crypto.randomUUID(),
						metadataCache: undefined,
						writeSignalListener: undefined,
						contextName: bindTarget.name,
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
		if (!this.viewFieldDeclaration.code) {
			return;
		}

		const isAsync = this.viewFieldDeclaration.code.contains('await');
		const funcConstructor = isAsync ? async function (): Promise<void> {}.constructor : Function;
		this.expression = funcConstructor('app', 'mb', 'dv', 'filePath', 'context', this.viewFieldDeclaration.code);
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
			throw new Error("Can't evaluate expression. Expression is undefined.");
		}

		const context = this.buildContext();
		try {
			return await Promise.resolve<string>(this.expression(this.plugin.app, this.plugin.api, getAPI(this.plugin.app), this.filePath, context));
		} catch (e: any) {
			console.warn(new MetaBindExpressionError(`failed to evaluate js expression`), {
				declaration: this.viewFieldDeclaration.code,
				context: context,
			});
			throw new MetaBindExpressionError(`failed to evaluate js expression with reason: ${e.message}`);
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
				variable.bindTargetDeclaration.file,
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
			this.plugin.metadataManager.unregister(variable.bindTargetDeclaration.file, this.uuid + '/' + variable.uuid);
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

		if (this.error) {
			this.renderError(this.error);
			return;
		}

		this.registerSelfToMetadataManager();

		this.plugin.registerMarkdownRenderChild(this);

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

		this.plugin.unregisterMarkdownRenderChild(this);
		this.unregisterSelfFromMetadataManager();

		this.containerEl.empty();
		this.containerEl.createEl('span', { text: 'unloaded meta bind view field', cls: 'meta-bind-plugin-error' });

		super.onunload();
	}
}

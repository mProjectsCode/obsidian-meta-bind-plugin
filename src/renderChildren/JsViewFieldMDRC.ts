import MetaBindPlugin from '../main';
import { ErrorLevel, MetaBindExpressionError, MetaBindJsError } from '../utils/errors/MetaBindErrors';
import { Listener, Signal } from '../utils/Signal';
import { RenderChildType } from './InputFieldMDRC';
import { JsViewFieldDeclaration } from '../parsers/ViewFieldDeclarationParser';
import { ViewField } from '../viewFields/ViewField';
import { ViewFieldVariable } from './ViewFieldMDRC';
import { getAPI } from 'obsidian-dataview';
import { AbstractViewFieldMDRC } from './AbstractViewFieldMDRC';
import ErrorIndicatorComponent from '../utils/errors/ErrorIndicatorComponent.svelte';

export class JsViewFieldMDRC extends AbstractViewFieldMDRC {
	viewField: ViewField;

	fullDeclaration?: string;
	// user code function
	expression?: any;
	viewFieldDeclaration: JsViewFieldDeclaration;
	variables: ViewFieldVariable[];
	private metadataManagerReadSignalListener: Listener<any> | undefined;

	constructor(
		containerEl: HTMLElement,
		renderChildType: RenderChildType,
		declaration: JsViewFieldDeclaration,
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
				this.errorCollection.add(e);
			}
		}
	}

	parseExpression(): void {
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
			throw new MetaBindJsError(ErrorLevel.CRITICAL, "Can't evaluate expression.", 'Expression is undefined.');
		}
		if (!this.plugin.settings.enableJs) {
			throw new MetaBindJsError(ErrorLevel.CRITICAL, "Can't evaluate expression.", 'JS expressions are disabled in the plugin settings.');
		}

		const context = this.buildContext();
		try {
			return await Promise.resolve<string>(this.expression(this.plugin.app, this.plugin.api, getAPI(this.plugin.app), this.filePath, context));
		} catch (e: any) {
			throw new MetaBindExpressionError(ErrorLevel.ERROR, `failed to evaluate js expression`, e, {
				declaration: this.viewFieldDeclaration.code,
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

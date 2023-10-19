import MetaBindPlugin from '../main';
import { ErrorLevel, MetaBindExpressionError, MetaBindJsError } from '../utils/errors/MetaBindErrors';
import { Signal } from '../utils/Signal';
import { RenderChildType } from './InputFieldMDRC';
import { ViewFieldVariable } from './ViewFieldMDRC';
import { getAPI } from 'obsidian-dataview';
import { AbstractViewFieldMDRC } from './AbstractViewFieldMDRC';
import ErrorIndicatorComponent from '../utils/errors/ErrorIndicatorComponent.svelte';
import { JsViewFieldDeclaration } from '../parsers/viewFieldParser/ViewFieldDeclaration';
import { ComputedMetadataSubscription, ComputedSubscriptionDependency } from '../metadata/MetadataFileCache';

export class JsViewFieldMDRC extends AbstractViewFieldMDRC {
	fullDeclaration?: string;
	// user code function
	expression?: any;
	viewFieldDeclaration: JsViewFieldDeclaration;
	variables: ViewFieldVariable[];
	renderContainer?: HTMLElement;
	metadataSubscription?: ComputedMetadataSubscription;

	constructor(
		containerEl: HTMLElement,
		renderChildType: RenderChildType,
		declaration: JsViewFieldDeclaration,
		plugin: MetaBindPlugin,
		filePath: string,
		uuid: string
	) {
		super(containerEl, renderChildType, plugin, filePath, uuid);

		this.errorCollection.merge(declaration.errorCollection);

		this.fullDeclaration = declaration.fullDeclaration;
		this.viewFieldDeclaration = declaration;
		this.variables = [];

		if (this.errorCollection.isEmpty()) {
			try {
				for (const bindTargetMapping of this.viewFieldDeclaration.bindTargetMappings ?? []) {
					this.variables.push({
						bindTargetDeclaration: bindTargetMapping.bindTarget,
						writeSignal: new Signal<any>(undefined),
						uuid: self.crypto.randomUUID(),
						writeSignalListener: undefined,
						contextName: bindTargetMapping.name,
						listenToChildren: bindTargetMapping.listenToChildren,
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
		const updateSignal = new Signal<any>(undefined);

		this.metadataSubscription = this.plugin.metadataManager.subscribeComputed(
			this.uuid,
			updateSignal,
			undefined,
			this.variables.map((x): ComputedSubscriptionDependency => {
				return {
					bindTarget: this.plugin.api.bindTargetParser.toFullDeclaration(x.bindTargetDeclaration, this.filePath),
					callbackSignal: x.writeSignal,
				};
			}),
			() => this.update()
		);

		// for (const variable of this.variables) {
		// 	variable.writeSignalListener = variable.writeSignal.registerListener({
		// 		callback: () => {
		// 			this.update();
		// 		},
		// 	});
		//
		// 	this.plugin.metadataManager.register(
		// 		variable.bindTargetDeclaration.filePath ?? this.filePath,
		// 		variable.writeSignal,
		// 		variable.bindTargetDeclaration.metadataPath,
		// 		variable.listenToChildren,
		// 		this.uuid + '/' + variable.uuid
		// 	);
		// }
	}

	unregisterSelfFromMetadataManager(): void {
		this.metadataSubscription?.unsubscribe();

		// for (const variable of this.variables) {
		// 	if (variable.writeSignalListener) {
		// 		variable.writeSignal.unregisterListener(variable.writeSignalListener);
		// 	}
		// 	this.plugin.metadataManager.unregister(variable.bindTargetDeclaration.filePath ?? this.filePath, this.uuid + '/' + variable.uuid);
		// }
	}

	getInitialValue(): string {
		return '';
	}

	async onload(): Promise<void> {
		console.log('meta-bind | ViewFieldMarkdownRenderChild >> load', this);

		this.containerEl.addClass('mb-view');
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
		container.addClass('mb-view-wrapper');

		this.renderContainer = container;
		await this.update();

		this.containerEl.appendChild(container);
	}

	onunload(): void {
		console.log('meta-bind | ViewFieldMarkdownRenderChild >> unload', this);

		this.plugin.mdrcManager.unregisterMDRC(this);
		this.unregisterSelfFromMetadataManager();

		this.containerEl.empty();
		this.containerEl.createEl('span', { text: 'unloaded meta bind view field', cls: 'mb-error' });

		super.onunload();
	}

	async update(): Promise<void> {
		if (!this.renderContainer) {
			return;
		}

		try {
			this.renderContainer.innerText = await this.evaluateExpression();
			this.renderContainer.removeClass('mb-error');
		} catch (e) {
			if (e instanceof Error) {
				this.renderContainer.innerText = e.message;
				this.renderContainer.addClass('mb-error');
			}
		}
	}
}

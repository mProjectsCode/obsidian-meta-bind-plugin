import type MetaBindPlugin from '../main';
import { ErrorLevel, MetaBindExpressionError, MetaBindJsError } from '../utils/errors/MetaBindErrors';
import { Signal } from '../utils/Signal';
import { type RenderChildType } from './InputFieldMDRC';
import { type ViewFieldVariable } from './ViewFieldMDRC';
import { getAPI } from 'obsidian-dataview';
import { AbstractViewFieldMDRC } from './AbstractViewFieldMDRC';
import ErrorIndicatorComponent from '../utils/errors/ErrorIndicatorComponent.svelte';
import { type JsViewFieldDeclaration } from '../parsers/viewFieldParser/ViewFieldDeclaration';
import { type ComputedMetadataSubscription, type ComputedSubscriptionDependency } from '../metadata/ComputedMetadataSubscription';
import { getUUID } from '../utils/Utils';

export class JsViewFieldMDRC extends AbstractViewFieldMDRC {
	fullDeclaration?: string;
	// user code function
	expression?: (...args: unknown[]) => unknown;
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
		uuid: string,
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
						inputSignal: new Signal<unknown>(undefined),
						uuid: getUUID(),
						contextName: bindTargetMapping.name,
					});
				}

				this.parseExpression();
			} catch (e) {
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
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		this.expression = funcConstructor('app', 'mb', 'dv', 'filePath', 'context', this.viewFieldDeclaration.code);
	}

	buildContext(): Record<string, unknown> {
		const context: Record<string, unknown> = {};
		for (const variable of this.variables ?? []) {
			if (!variable.contextName || !variable.inputSignal) {
				continue;
			}

			context[variable.contextName] = variable.inputSignal.get() ?? '';
		}

		return context;
	}

	async evaluateExpression(): Promise<string> {
		if (!this.expression) {
			throw new MetaBindJsError({
				errorLevel: ErrorLevel.CRITICAL,
				effect: "Can't evaluate expression.",
				cause: 'Expression is undefined.',
			});
		}
		if (!this.plugin.settings.enableJs) {
			throw new MetaBindJsError({
				errorLevel: ErrorLevel.CRITICAL,
				effect: "Can't evaluate expression.",
				cause: 'JS expressions are disabled in the plugin settings.',
			});
		}

		const context = this.buildContext();
		try {
			const retValue = await Promise.resolve<unknown>(this.expression(this.plugin.app, this.plugin.api, getAPI(this.plugin.app), this.filePath, context));
			return retValue?.toString() ?? 'null';
		} catch (e) {
			if (e instanceof Error) {
				throw new MetaBindExpressionError({
					errorLevel: ErrorLevel.ERROR,
					effect: `failed to evaluate js expression`,
					cause: e,
					context: {
						declaration: this.viewFieldDeclaration.code,
						context: context,
					},
				});
			} else {
				throw new Error('failed to evaluate js expression because of: unexpected thrown value');
			}
		}
	}

	registerSelfToMetadataManager(): void {
		const updateSignal = new Signal<unknown>(undefined);

		this.metadataSubscription = this.plugin.metadataManager.subscribeComputed(
			this.uuid,
			updateSignal,
			undefined,
			this.variables.map((x): ComputedSubscriptionDependency => {
				return {
					bindTarget: this.plugin.api.bindTargetParser.toFullDeclaration(x.bindTargetDeclaration, this.filePath),
					callbackSignal: x.inputSignal,
				};
			}),
			() => this.update(),
		);
	}

	unregisterSelfFromMetadataManager(): void {
		this.metadataSubscription?.unsubscribe();
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

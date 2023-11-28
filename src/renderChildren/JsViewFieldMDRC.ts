import type MetaBindPlugin from '../main';
import { ErrorLevel, MetaBindJsError } from '../utils/errors/MetaBindErrors';
import { Signal } from '../utils/Signal';
import { type ViewFieldVariable } from './ViewFieldMDRC';
import { AbstractViewFieldMDRC } from './AbstractViewFieldMDRC';
import ErrorIndicatorComponent from '../utils/errors/ErrorIndicatorComponent.svelte';
import { type JsViewFieldDeclaration } from '../parsers/viewFieldParser/ViewFieldDeclaration';
import {
	type ComputedMetadataSubscription,
	type ComputedSubscriptionDependency,
} from '../metadata/ComputedMetadataSubscription';
import { getUUID } from '../utils/Utils';
import { type App, type TFile } from 'obsidian';
import { type API as JsEngineAPI } from 'jsEngine/api/API';
import type JsEnginePlugin from 'jsEngine/main';
import { type JsExecution } from 'jsEngine/engine/JsExecution';
import { type RenderChildType } from '../config/FieldConfigs';

function getJsEngineAPI(app: App): JsEngineAPI | undefined {
	return (app.plugins.getPlugin('js-engine') as JsEnginePlugin | undefined)?.api;
}

export class JsViewFieldMDRC extends AbstractViewFieldMDRC {
	fullDeclaration?: string;
	viewFieldDeclaration: JsViewFieldDeclaration;
	variables: ViewFieldVariable[];
	renderContainer?: HTMLElement;
	metadataSubscription?: ComputedMetadataSubscription;
	file: TFile;

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
		this.file = this.plugin.app.vault.getAbstractFileByPath(this.filePath) as TFile;

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
			} catch (e) {
				this.errorCollection.add(e);
			}
		}
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

	async evaluateExpression(): Promise<JsExecution> {
		if (!this.plugin.settings.enableJs) {
			throw new MetaBindJsError({
				errorLevel: ErrorLevel.CRITICAL,
				effect: "Can't evaluate expression.",
				cause: 'JS expressions are disabled in the plugin settings.',
			});
		}

		const jsEngine = getJsEngineAPI(this.plugin.app);
		if (jsEngine === undefined) {
			throw new MetaBindJsError({
				errorLevel: ErrorLevel.ERROR,
				effect: 'can not evaluate js view field',
				cause: 'js view fields need the JS Engine plugin to be installed',
			});
		}

		const executionPromise = jsEngine.internal.execute({
			code: this.viewFieldDeclaration.code,
			context: {
				file: this.file,
				line: 0,
				metadata: this.plugin.app.metadataCache.getFileCache(this.file),
			},
			container: this.renderContainer,
			component: this,
			contextOverrides: {
				bound: this.buildContext(),
			},
		});

		return await executionPromise;
	}

	registerSelfToMetadataManager(): void {
		const updateSignal = new Signal<unknown>(undefined);

		this.metadataSubscription = this.plugin.metadataManager.subscribeComputed(
			this.uuid,
			updateSignal,
			this.viewFieldDeclaration.writeToBindTarget,
			this.variables.map((x): ComputedSubscriptionDependency => {
				return {
					bindTarget: x.bindTargetDeclaration,
					callbackSignal: x.inputSignal,
				};
			}),
			async () => await this.update(),
			() => this.unload(),
		);
	}

	unregisterSelfFromMetadataManager(): void {
		this.metadataSubscription?.unsubscribe();
	}

	async onload(): Promise<void> {
		console.log('meta-bind | ViewFieldMarkdownRenderChild >> load', this);

		this.containerEl.addClass('mb-view');
		this.containerEl.empty();

		if (getJsEngineAPI(this.plugin.app) === undefined) {
			this.errorCollection.add(
				new MetaBindJsError({
					errorLevel: ErrorLevel.ERROR,
					effect: 'can not create js view field',
					cause: 'js view fields need the JS Engine plugin to be installed',
				}),
			);
		}

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

	async update(): Promise<unknown> {
		if (!this.renderContainer) {
			return undefined;
		}

		try {
			const jsEngine = getJsEngineAPI(this.plugin.app);
			if (jsEngine === undefined) {
				throw new MetaBindJsError({
					errorLevel: ErrorLevel.ERROR,
					effect: 'can not evaluate js view field',
					cause: 'js view fields need the JS Engine plugin to be installed',
				});
			}

			const execution = await this.evaluateExpression();
			const renderer = jsEngine.internal.createRenderer(this.renderContainer, this.filePath, this);

			await renderer.render(execution.result);

			return renderer.renderToSimpleObject(execution.result);
		} catch (e) {
			if (e instanceof Error) {
				this.renderContainer.innerText = e.message;
				this.renderContainer.addClass('mb-error');
			}
			return undefined;
		}
	}
}

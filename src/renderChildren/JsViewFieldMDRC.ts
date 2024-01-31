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
import { getUUID, showUnloadedMessage } from '../utils/Utils';
import { type TFile } from 'obsidian';
import { type JsExecution } from 'jsEngine/engine/JsExecution';
import { type RenderChildType } from '../config/FieldConfigs';
import { getJsEnginePluginAPI } from '../utils/ObsUtils';

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

		let jsEngine = undefined;
		try {
			jsEngine = getJsEnginePluginAPI(this.plugin);
		} catch (e) {
			if (e instanceof Error) {
				throw new MetaBindJsError({
					errorLevel: ErrorLevel.ERROR,
					effect: 'can not create js view field',
					cause: e,
				});
			} else {
				throw e;
			}
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
		console.debug('meta-bind | ViewFieldMarkdownRenderChild >> load', this);

		this.containerEl.addClass('mb-view');
		this.containerEl.empty();

		this.plugin.mdrcManager.registerMDRC(this);

		try {
			getJsEnginePluginAPI(this.plugin);
		} catch (e) {
			if (e instanceof Error) {
				this.errorCollection.add(
					new MetaBindJsError({
						errorLevel: ErrorLevel.ERROR,
						effect: 'can not create js view field',
						cause: e,
					}),
				);
			} else {
				this.errorCollection.add(e);
			}
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

		const container: HTMLDivElement = createDiv();
		container.addClass('mb-view-wrapper');

		this.renderContainer = container;
		await this.update();

		this.containerEl.appendChild(container);
	}

	onunload(): void {
		console.debug('meta-bind | ViewFieldMarkdownRenderChild >> unload', this);

		this.plugin.mdrcManager.unregisterMDRC(this);
		this.unregisterSelfFromMetadataManager();

		showUnloadedMessage(this.containerEl, 'js view field');

		super.onunload();
	}

	async update(): Promise<unknown> {
		if (!this.renderContainer) {
			return undefined;
		}

		try {
			const jsEngine = getJsEnginePluginAPI(this.plugin);

			const execution = await this.evaluateExpression();
			const renderer = jsEngine.internal.createRenderer(this.renderContainer, this.filePath, this);

			await renderer.render(execution.result);

			return renderer.convertToSimpleObject(execution.result);
		} catch (e) {
			if (e instanceof Error) {
				this.renderContainer.innerText = e.message;
				this.renderContainer.addClass('mb-error');
			}
			return undefined;
		}
	}
}

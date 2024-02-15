import { type IPlugin } from '../../IPlugin';
import { type RenderChildType } from '../../config/FieldConfigs';
import { ErrorCollection } from '../../utils/errors/ErrorCollection';
import type { JsViewFieldDeclaration } from '../../parsers/viewFieldParser/ViewFieldDeclaration';
import { type ViewFieldVariable } from './ViewFieldVariable';
import type {
	ComputedMetadataSubscription,
	ComputedSubscriptionDependency,
} from '../../metadata/ComputedMetadataSubscription';
import { Signal } from '../../utils/Signal';
import { getUUID, showUnloadedMessage } from '../../utils/Utils';
import { ErrorLevel, MetaBindJsError } from '../../utils/errors/MetaBindErrors';
import { type IJsRenderer } from './jsRenderer/IJsRenderer';

export class JsViewField {
	readonly plugin: IPlugin;
	filePath: string;
	uuid: string;
	renderChildType: RenderChildType;
	errorCollection: ErrorCollection;
	containerEl: HTMLElement;

	declarationString: string | undefined;
	declaration: JsViewFieldDeclaration;

	variables: ViewFieldVariable[];
	metadataSubscription: ComputedMetadataSubscription | undefined;
	jsRenderer: IJsRenderer | undefined;

	constructor(
		plugin: IPlugin,
		uuid: string,
		filePath: string,
		containerEl: HTMLElement,
		renderChildType: RenderChildType,
		declaration: JsViewFieldDeclaration,
	) {
		this.plugin = plugin;
		this.filePath = filePath;
		this.containerEl = containerEl;
		this.renderChildType = renderChildType;
		this.declaration = declaration;

		this.declarationString = declaration.fullDeclaration;

		this.uuid = uuid;
		this.errorCollection = new ErrorCollection(this.uuid);
		this.errorCollection.merge(declaration.errorCollection);

		this.variables = [];

		this.buildVariables();
	}

	private buildVariables(): void {
		if (this.errorCollection.isEmpty()) {
			try {
				for (const bindTargetMapping of this.declaration.bindTargetMappings ?? []) {
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

	private buildContext(): Record<string, unknown> {
		const context: Record<string, unknown> = {};
		for (const variable of this.variables ?? []) {
			if (!variable.contextName || !variable.inputSignal) {
				continue;
			}

			context[variable.contextName] = variable.inputSignal.get() ?? '';
		}

		return context;
	}

	private async evaluate(): Promise<unknown> {
		return this.jsRenderer?.evaluate({
			bound: this.buildContext(),
		});
	}

	private registerSelfToMetadataManager(): void {
		const updateSignal = new Signal<unknown>(undefined);

		this.metadataSubscription = this.plugin.metadataManager.subscribeComputed(
			this.uuid,
			updateSignal,
			this.declaration.writeToBindTarget,
			this.variables.map((x): ComputedSubscriptionDependency => {
				return {
					bindTarget: x.bindTargetDeclaration,
					callbackSignal: x.inputSignal,
				};
			}),
			async () => await this.evaluate(),
			() => this.destroy(),
		);
	}

	private unregisterSelfFromMetadataManager(): void {
		this.metadataSubscription?.unsubscribe();
	}

	private createErrorIndicator(containerEl: HTMLElement): void {
		this.plugin.internal.createErrorIndicator(containerEl, {
			errorCollection: this.errorCollection,
			errorText:
				'Errors caused the creation of the field to fail. Sometimes one error only occurs because of another.',
			warningText:
				'Warnings will not cause the creation of a field to fail, but they indicate that a part of the declaration was invalid or uses deprecated functionality.',
			code: this.declarationString,
		});
	}

	mount(): void {
		console.debug('meta-bind | JsViewField >> load', this);

		this.containerEl.addClass('mb-view');
		this.containerEl.empty();

		if (!this.plugin.internal.isJsEngineAvailable()) {
			this.errorCollection.add(
				new MetaBindJsError({
					errorLevel: ErrorLevel.ERROR,
					effect: 'can not create js view field',
					cause: 'The JS Engine plugin is not installed and enabled.',
				}),
			);
		}

		if (!this.plugin.settings.enableJs) {
			throw new MetaBindJsError({
				errorLevel: ErrorLevel.CRITICAL,
				effect: "Can't evaluate expression.",
				cause: 'JS expressions are disabled in the plugin settings.',
			});
		}

		this.createErrorIndicator(this.containerEl);

		if (this.errorCollection.hasErrors()) {
			return;
		}

		const wrapperEl: HTMLDivElement = createDiv();
		wrapperEl.addClass('mb-view-wrapper');

		this.jsRenderer = this.plugin.internal.createJsRenderer(wrapperEl, this.filePath, this.declaration.code);

		this.registerSelfToMetadataManager();

		this.containerEl.appendChild(wrapperEl);
	}

	destroy(): void {
		console.debug('meta-bind | JsViewField >> unload', this);

		this.unregisterSelfFromMetadataManager();

		showUnloadedMessage(this.containerEl, 'js view field');
	}
}

import { type IPlugin } from 'packages/core/src/IPlugin';
import { FieldMountable } from 'packages/core/src/fields/FieldMountable';
import { type ViewFieldVariable } from 'packages/core/src/fields/viewFields/ViewFieldVariable';
import type {
	ComputedMetadataSubscription,
	ComputedSubscriptionDependency,
} from 'packages/core/src/metadata/ComputedMetadataSubscription';
import type { JsViewFieldDeclaration } from 'packages/core/src/parsers/viewFieldParser/ViewFieldDeclaration';
import { type IJsRenderer } from 'packages/core/src/utils/IJsRenderer';
import { Signal } from 'packages/core/src/utils/Signal';
import { DomHelpers, getUUID, showUnloadedMessage } from 'packages/core/src/utils/Utils';
import { ErrorCollection } from 'packages/core/src/utils/errors/ErrorCollection';
import { ErrorLevel, MetaBindJsError } from 'packages/core/src/utils/errors/MetaBindErrors';

export class JsViewFieldMountable extends FieldMountable {
	errorCollection: ErrorCollection;

	declarationString: string | undefined;
	declaration: JsViewFieldDeclaration;

	variables: ViewFieldVariable[];
	metadataSubscription: ComputedMetadataSubscription | undefined;
	jsRenderer: IJsRenderer | undefined;

	constructor(plugin: IPlugin, uuid: string, filePath: string, declaration: JsViewFieldDeclaration) {
		super(plugin, uuid, filePath);

		this.declaration = declaration;

		this.declarationString = declaration.declarationString;

		this.errorCollection = new ErrorCollection(this.getUuid());
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
			this.getUuid(),
			updateSignal,
			this.declaration.writeToBindTarget,
			this.variables.map((x): ComputedSubscriptionDependency => {
				return {
					bindTarget: x.bindTargetDeclaration,
					callbackSignal: x.inputSignal,
				};
			}),
			async () => await this.evaluate(),
			() => this.unmount(),
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

	protected onMount(targetEl: HTMLElement): void {
		console.debug('meta-bind | JsViewFieldMountable >> mount', this.declaration);
		super.onMount(targetEl);

		DomHelpers.addClass(targetEl, 'mb-view');
		DomHelpers.empty(targetEl);

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

		this.createErrorIndicator(targetEl);

		if (this.errorCollection.hasErrors()) {
			return;
		}

		const wrapperEl: HTMLDivElement = document.createElement('div');
		DomHelpers.addClass(wrapperEl, 'mb-view-wrapper');

		this.jsRenderer = this.plugin.internal.createJsRenderer(
			wrapperEl,
			this.getFilePath(),
			this.declaration.code,
			this.declaration.hidden,
		);

		this.registerSelfToMetadataManager();

		targetEl.appendChild(wrapperEl);
	}

	protected onUnmount(targetEl: HTMLElement): void {
		console.debug('meta-bind | JsViewFieldMountable >> unmount', this.declaration);
		super.onUnmount(targetEl);

		this.unregisterSelfFromMetadataManager();

		showUnloadedMessage(targetEl, 'js view field');
	}
}

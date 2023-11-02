import { Signal } from '../utils/Signal';
import { type RenderChildType } from './InputFieldMDRC';
import { AbstractViewFieldMDRC } from './AbstractViewFieldMDRC';
import type MetaBindPlugin from '../main';
import ErrorIndicatorComponent from '../utils/errors/ErrorIndicatorComponent.svelte';
import { type BindTargetDeclaration } from '../parsers/inputFieldParser/InputFieldDeclaration';
import { type ViewFieldDeclaration } from '../parsers/viewFieldParser/ViewFieldDeclaration';
import { type AbstractViewField } from '../viewFields/AbstractViewField';
import { ErrorLevel, MetaBindInternalError } from '../utils/errors/MetaBindErrors';
import { type ViewFieldArgumentMapType } from '../fieldArguments/viewFieldArguments/ViewFieldArgumentFactory';
import { type ComputedMetadataSubscription, type ComputedSubscriptionDependency } from '../metadata/ComputedMetadataSubscription';
import { ViewFieldArgumentType } from '../parsers/GeneralConfigs';

export interface ViewFieldVariable {
	bindTargetDeclaration: BindTargetDeclaration;
	inputSignal: Signal<unknown>;
	uuid: string;
	contextName: string | undefined;
}

export class ViewFieldMDRC extends AbstractViewFieldMDRC {
	viewField?: AbstractViewField;

	fullDeclaration?: string;
	viewFieldDeclaration: ViewFieldDeclaration;
	variables: ViewFieldVariable[];
	metadataSubscription?: ComputedMetadataSubscription;
	inputSignal: Signal<unknown>;

	constructor(
		containerEl: HTMLElement,
		renderChildType: RenderChildType,
		declaration: ViewFieldDeclaration,
		plugin: MetaBindPlugin,
		filePath: string,
		uuid: string,
	) {
		super(containerEl, renderChildType, plugin, filePath, uuid);

		this.errorCollection.merge(declaration.errorCollection);

		this.fullDeclaration = declaration.fullDeclaration;
		this.viewFieldDeclaration = declaration;
		this.variables = [];
		this.inputSignal = new Signal<unknown>(undefined);

		if (this.errorCollection.isEmpty()) {
			try {
				this.viewField = this.plugin.api.viewFieldFactory.createViewField(declaration.viewFieldType, this);
				this.variables = this.viewField?.buildVariables(this.viewFieldDeclaration) ?? [];
			} catch (e) {
				this.errorCollection.add(e);
			}
		}
	}

	registerSelfToMetadataManager(): void {
		try {
			this.metadataSubscription = this.plugin.metadataManager.subscribeComputed(
				this.uuid,
				this.inputSignal,
				this.plugin.api.bindTargetParser.toFullDeclaration(this.viewFieldDeclaration.writeToBindTarget, this.filePath),
				this.variables.map((x): ComputedSubscriptionDependency => {
					return {
						bindTarget: this.plugin.api.bindTargetParser.toFullDeclaration(x.bindTargetDeclaration, this.filePath),
						callbackSignal: x.inputSignal,
					};
				}),
				async () => await this.viewField?.computeValue(this.variables),
			);

			this.inputSignal.registerListener({ callback: value => void this.viewField?.update(value) });
		} catch (e) {
			this.errorCollection.add(e);
		}

		// for (const variable of this.variables) {
		// 	variable.writeSignalListener = variable.writeSignal.registerListener({
		// 		callback: () => {
		// 			this.viewField?.update(this.variables);
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

	getArguments<T extends ViewFieldArgumentType>(name: T): ViewFieldArgumentMapType<T>[] {
		if (this.viewFieldDeclaration.errorCollection.hasErrors()) {
			throw new MetaBindInternalError(ErrorLevel.ERROR, 'can not retrieve arguments', 'inputFieldDeclaration has errors');
		}

		return this.viewFieldDeclaration.argumentContainer.getAll(name);
	}

	getArgument<T extends ViewFieldArgumentType>(name: T): ViewFieldArgumentMapType<T> | undefined {
		return this.getArguments(name).at(0);
	}

	onload(): void {
		console.log('meta-bind | ViewFieldMarkdownRenderChild >> load', this);

		this.containerEl.addClass('mb-view');
		this.containerEl.empty();

		if (!this.errorCollection.hasErrors()) {
			this.registerSelfToMetadataManager();
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

		this.plugin.mdrcManager.registerMDRC(this);

		const container: HTMLDivElement = createDiv();
		container.addClass('mb-view-wrapper');

		void this.viewField?.render(container);

		this.containerEl.appendChild(container);
	}

	onunload(): void {
		console.log('meta-bind | ViewFieldMarkdownRenderChild >> unload', this);

		this.plugin.mdrcManager.unregisterMDRC(this);
		this.unregisterSelfFromMetadataManager();
		this.viewField?.destroy();

		this.containerEl.empty();
		this.containerEl.createEl('span', { text: 'unloaded meta bind view field', cls: 'mb-error' });

		super.onunload();
	}
}

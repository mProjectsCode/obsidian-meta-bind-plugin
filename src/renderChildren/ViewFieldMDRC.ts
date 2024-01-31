import { type Signal } from '../utils/Signal';
import { AbstractViewFieldMDRC } from './AbstractViewFieldMDRC';
import type MetaBindPlugin from '../main';
import ErrorIndicatorComponent from '../utils/errors/ErrorIndicatorComponent.svelte';
import { type ViewFieldDeclaration } from '../parsers/viewFieldParser/ViewFieldDeclaration';
import { type AbstractViewField } from '../fields/viewFields/AbstractViewField';
import { ErrorLevel, MetaBindInternalError } from '../utils/errors/MetaBindErrors';
import { type ViewFieldArgumentMapType } from '../fields/fieldArguments/viewFieldArguments/ViewFieldArgumentFactory';
import { RenderChildType, type ViewFieldArgumentType } from '../config/FieldConfigs';
import { type BindTargetDeclaration } from '../parsers/bindTargetParser/BindTargetDeclaration';
import { type IViewFieldBase } from '../fields/viewFields/IViewFieldBase';
import { showUnloadedMessage } from '../utils/Utils';

export interface ViewFieldVariable {
	bindTargetDeclaration: BindTargetDeclaration;
	inputSignal: Signal<unknown>;
	uuid: string;
	contextName: string | undefined;
}

export class ViewFieldMDRC extends AbstractViewFieldMDRC implements IViewFieldBase {
	viewField: AbstractViewField | undefined;

	fullDeclaration?: string;
	viewFieldDeclaration: ViewFieldDeclaration;

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
	}

	getArguments<T extends ViewFieldArgumentType>(name: T): ViewFieldArgumentMapType<T>[] {
		if (this.viewFieldDeclaration.errorCollection.hasErrors()) {
			throw new MetaBindInternalError({
				errorLevel: ErrorLevel.ERROR,
				effect: 'an not retrieve arguments',
				cause: 'inputFieldDeclaration has errors',
			});
		}

		return this.viewFieldDeclaration.argumentContainer.getAll(name);
	}

	getArgument<T extends ViewFieldArgumentType>(name: T): ViewFieldArgumentMapType<T> | undefined {
		return this.getArguments(name).at(0);
	}

	public getDeclaration(): ViewFieldDeclaration {
		return this.viewFieldDeclaration;
	}

	public getUuid(): string {
		return this.uuid;
	}

	public getFilePath(): string {
		return this.filePath;
	}

	private createErrorIndicator(el: HTMLElement): void {
		new ErrorIndicatorComponent({
			target: el,
			props: {
				app: this.plugin.app,
				errorCollection: this.errorCollection,
				declaration: this.fullDeclaration,
			},
		});
	}

	private createViewField(): void {
		if (!this.errorCollection.hasErrors()) {
			try {
				this.viewField = this.plugin.api.viewFieldFactory.createViewField(
					this.viewFieldDeclaration.viewFieldType,
					this,
				);
			} catch (e) {
				this.errorCollection.add(e);
			}
		}

		if (!this.errorCollection.hasErrors() && !this.viewField) {
			this.errorCollection.add(
				new MetaBindInternalError({
					errorLevel: ErrorLevel.CRITICAL,
					effect: "can't render view field",
					cause: 'view field is undefined',
				}),
			);
		}
	}

	onload(): void {
		console.debug('meta-bind | ViewFieldMarkdownRenderChild >> load', this);

		this.containerEl.addClass('mb-view');
		this.containerEl.empty();

		// --- Register to MDRC manager ---
		this.plugin.mdrcManager.registerMDRC(this);

		this.createViewField();

		// if there is an error, render error then quit
		if (this.errorCollection.hasErrors()) {
			this.createErrorIndicator(this.containerEl);
			return;
		}

		const container: HTMLDivElement = createDiv();
		container.addClass('mb-view-wrapper');

		try {
			this.viewField?.mount(container);
		} catch (e) {
			this.errorCollection.add(e);
		}

		this.createErrorIndicator(this.containerEl);
		this.containerEl.append(container);

		// --- Apply Block or Inline Class ---
		if (this.renderChildType === RenderChildType.BLOCK) {
			this.containerEl.addClass('mb-view-block');
		} else {
			this.containerEl.addClass('mb-view-inline');
		}
	}

	onunload(): void {
		console.debug('meta-bind | ViewFieldMarkdownRenderChild >> unload', this);

		this.viewField?.destroy();
		this.plugin.mdrcManager.unregisterMDRC(this);

		showUnloadedMessage(this.containerEl, 'view field');

		super.onunload();
	}
}

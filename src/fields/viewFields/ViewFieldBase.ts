import { type IPlugin } from '../../IPlugin';
import { RenderChildType, type ViewFieldArgumentType } from '../../config/FieldConfigs';
import { ErrorCollection } from '../../utils/errors/ErrorCollection';
import { DomHelpers, showUnloadedMessage } from '../../utils/Utils';
import { type AbstractViewField } from './AbstractViewField';
import type { ViewFieldDeclaration } from '../../parsers/viewFieldParser/ViewFieldDeclaration';
import { type ViewFieldArgumentMapType } from '../fieldArguments/viewFieldArguments/ViewFieldArgumentFactory';
import { ErrorLevel, MetaBindInternalError } from '../../utils/errors/MetaBindErrors';
import type { IFieldBase } from '../IFieldBase';

export interface IViewFieldBase extends IFieldBase {
	getDeclaration(): ViewFieldDeclaration;

	hasArgument<T extends ViewFieldArgumentType>(name: T): boolean;

	getArguments<T extends ViewFieldArgumentType>(name: T): ViewFieldArgumentMapType<T>[];

	getArgument<T extends ViewFieldArgumentType>(name: T): ViewFieldArgumentMapType<T> | undefined;
}

export class ViewFieldBase implements IViewFieldBase {
	readonly plugin: IPlugin;
	filePath: string;
	uuid: string;
	renderChildType: RenderChildType;
	errorCollection: ErrorCollection;
	containerEl: HTMLElement;

	viewField: AbstractViewField | undefined;
	declarationString: string | undefined;
	declaration: ViewFieldDeclaration;

	constructor(
		plugin: IPlugin,
		uuid: string,
		filePath: string,
		containerEl: HTMLElement,
		renderChildType: RenderChildType,
		declaration: ViewFieldDeclaration,
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
	}

	public hasArgument<T extends ViewFieldArgumentType>(name: T): boolean {
		return this.getArguments(name).length > 0;
	}

	public getArgument<T extends ViewFieldArgumentType>(name: T): ViewFieldArgumentMapType<T> | undefined {
		return this.getArguments(name).at(0);
	}

	public getArguments<T extends ViewFieldArgumentType>(name: T): ViewFieldArgumentMapType<T>[] {
		if (this.declaration.errorCollection.hasErrors()) {
			throw new MetaBindInternalError({
				errorLevel: ErrorLevel.ERROR,
				effect: 'an not retrieve arguments',
				cause: 'viewFieldDeclaration has errors',
			});
		}

		return this.declaration.argumentContainer.getAll(name);
	}

	public getDeclaration(): ViewFieldDeclaration {
		return this.declaration;
	}

	public getFilePath(): string {
		return this.filePath;
	}

	public getUuid(): string {
		return this.uuid;
	}

	private createViewField(): void {
		if (!this.errorCollection.hasErrors()) {
			try {
				this.viewField = this.plugin.api.viewFieldFactory.createViewField(this.declaration.viewFieldType, this);
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

	public mount(): void {
		console.debug('meta-bind | ViewFieldBase >> mount', this);

		DomHelpers.empty(this.containerEl);
		DomHelpers.addClass(this.containerEl, 'mb-view');

		this.createViewField();

		if (this.errorCollection.hasErrors()) {
			this.createErrorIndicator(this.containerEl);
			return;
		}

		const wrapperEl = document.createElement('div');
		wrapperEl.addClass('mb-view-wrapper');

		try {
			this.viewField?.mount(wrapperEl);
		} catch (e) {
			this.errorCollection.add(e);
		}

		this.createErrorIndicator(this.containerEl);
		this.containerEl.append(wrapperEl);

		DomHelpers.addClass(wrapperEl, `mb-view-type-${this.declaration.viewFieldType}`);

		if (this.renderChildType === RenderChildType.BLOCK) {
			DomHelpers.addClass(this.containerEl, 'mb-view-block');
		} else {
			DomHelpers.addClass(this.containerEl, 'mb-view-inline');
		}
	}

	public destroy(): void {
		console.debug('meta-bind | ViewFieldBase >> destroy', this);

		this.viewField?.destroy();

		showUnloadedMessage(this.containerEl, 'view field');
	}
}

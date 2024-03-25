import { type IPlugin } from 'packages/core/src/IPlugin';
import { RenderChildType, ViewFieldArgumentType } from 'packages/core/src/config/FieldConfigs';
import { FieldMountable } from 'packages/core/src/fields/FieldMountable';
import { type ViewFieldArgumentMapType } from 'packages/core/src/fields/fieldArguments/viewFieldArguments/ViewFieldArgumentFactory';
import { type AbstractViewField } from 'packages/core/src/fields/viewFields/AbstractViewField';
import type { ViewFieldDeclaration } from 'packages/core/src/parsers/viewFieldParser/ViewFieldDeclaration';
import { DomHelpers, showUnloadedMessage } from 'packages/core/src/utils/Utils';
import { ErrorCollection } from 'packages/core/src/utils/errors/ErrorCollection';
import { ErrorLevel, MetaBindInternalError } from 'packages/core/src/utils/errors/MetaBindErrors';

export class ViewFieldMountable extends FieldMountable {
	renderChildType: RenderChildType;
	errorCollection: ErrorCollection;

	viewField: AbstractViewField | undefined;
	declarationString: string | undefined;
	declaration: ViewFieldDeclaration;

	constructor(
		plugin: IPlugin,
		uuid: string,
		filePath: string,
		renderChildType: RenderChildType,
		declaration: ViewFieldDeclaration,
	) {
		super(plugin, uuid, filePath);

		this.renderChildType = renderChildType;
		this.declaration = declaration;
		this.declarationString = declaration.declarationString;

		this.errorCollection = new ErrorCollection(this.getUuid());
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

	private createViewField(): void {
		if (!this.errorCollection.hasErrors()) {
			try {
				this.viewField = this.plugin.api.viewFieldFactory.createViewField(this);
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

	protected onMount(targetEl: HTMLElement): void {
		console.debug('meta-bind | ViewFieldMountable >> mount', this.declaration);

		DomHelpers.empty(targetEl);
		DomHelpers.addClass(targetEl, 'mb-view');

		this.createViewField();

		if (this.errorCollection.hasErrors()) {
			this.createErrorIndicator(targetEl);
			return;
		}

		const wrapperEl = document.createElement('div');
		DomHelpers.addClass(wrapperEl, 'mb-view-wrapper');

		try {
			this.viewField?.mount(wrapperEl);
		} catch (e) {
			this.errorCollection.add(e);
		}

		this.createErrorIndicator(targetEl);
		targetEl.append(wrapperEl);

		const classArguments = this.getArguments(ViewFieldArgumentType.CLASS);
		for (const classArgument of classArguments) {
			DomHelpers.addClasses(wrapperEl, classArgument.value);
		}

		DomHelpers.addClass(wrapperEl, `mb-view-type-${this.declaration.viewFieldType}`);

		if (this.renderChildType === RenderChildType.BLOCK) {
			DomHelpers.addClass(targetEl, 'mb-view-block');
		} else {
			DomHelpers.addClass(targetEl, 'mb-view-inline');
		}
	}

	protected onUnmount(targetEl: HTMLElement): void {
		console.debug('meta-bind | ViewFieldMountable >> unmount', this.declaration);

		this.viewField?.unmount();

		showUnloadedMessage(targetEl, 'view field');
	}
}

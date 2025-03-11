import type { MetaBind } from 'packages/core/src';
import { RenderChildType } from 'packages/core/src/config/APIConfigs';
import { InputFieldArgumentType, InputFieldType } from 'packages/core/src/config/FieldConfigs';
import type { InputFieldArgumentMapType } from 'packages/core/src/fields/fieldArguments/inputFieldArguments/InputFieldArgumentFactory';
import { FieldMountable } from 'packages/core/src/fields/FieldMountable';
import type { InputField } from 'packages/core/src/fields/inputFields/InputFieldFactory';
import type { BindTargetDeclaration } from 'packages/core/src/parsers/bindTargetParser/BindTargetDeclaration';
import type { InputFieldDeclaration } from 'packages/core/src/parsers/inputFieldParser/InputFieldDeclaration';
import { DocsUtils } from 'packages/core/src/utils/DocsUtils';
import { ErrorCollection } from 'packages/core/src/utils/errors/ErrorCollection';
import { ErrorLevel, MetaBindInternalError } from 'packages/core/src/utils/errors/MetaBindErrors';
import { DomHelpers, showUnloadedMessage } from 'packages/core/src/utils/Utils';

export class InputFieldMountable extends FieldMountable {
	renderChildType: RenderChildType;
	errorCollection: ErrorCollection;

	inputField: InputField | undefined;
	declarationString: string | undefined;
	declaration: InputFieldDeclaration;

	constructor(
		mb: MetaBind,
		uuid: string,
		filePath: string,
		renderChildType: RenderChildType,
		declaration: InputFieldDeclaration,
	) {
		super(mb, uuid, filePath);

		this.renderChildType = renderChildType;
		this.declaration = declaration;

		this.declarationString = declaration.declarationString;

		this.errorCollection = new ErrorCollection(this.getUuid());
		this.errorCollection.merge(declaration.errorCollection);
	}

	public hasArgument<T extends InputFieldArgumentType>(name: T): boolean {
		return this.getArguments(name).length > 0;
	}

	public getArgument<T extends InputFieldArgumentType>(name: T): InputFieldArgumentMapType<T> | undefined {
		return this.getArguments(name).at(0);
	}

	public getArguments<T extends InputFieldArgumentType>(name: T): InputFieldArgumentMapType<T>[] {
		if (this.declaration.errorCollection.hasErrors()) {
			throw new MetaBindInternalError({
				errorLevel: ErrorLevel.CRITICAL,
				effect: 'can not retrieve arguments',
				cause: 'inputFieldDeclaration has errors',
			});
		}

		return this.declaration.argumentContainer.getAll(name);
	}

	public getBindTarget(): BindTargetDeclaration | undefined {
		return this.declaration.bindTarget;
	}

	private shouldAddCardContainer(): boolean {
		const containerInputFieldType =
			this.declaration.inputFieldType === InputFieldType.SELECT ||
			this.declaration.inputFieldType === InputFieldType.MULTI_SELECT ||
			this.declaration.inputFieldType === InputFieldType.LIST;

		const hasContainerArgument =
			this.hasArgument(InputFieldArgumentType.SHOWCASE) || this.hasArgument(InputFieldArgumentType.TITLE);

		return this.renderChildType === RenderChildType.BLOCK && (containerInputFieldType || hasContainerArgument);
	}

	private createContainer(containerEl: HTMLElement): HTMLElement {
		if (this.shouldAddCardContainer()) {
			const cardContainerEl = DomHelpers.createElement(containerEl, 'div');
			DomHelpers.addClass(cardContainerEl, 'mb-card');

			const titleArgument = this.getArgument(InputFieldArgumentType.TITLE);
			if (titleArgument) {
				DomHelpers.createElement(cardContainerEl, 'h3', { text: titleArgument.value });
			}

			return cardContainerEl;
		}
		return containerEl;
	}

	private addShowcase(containerEl: HTMLElement): void {
		const showcaseArgument = this.getArgument(InputFieldArgumentType.SHOWCASE);
		if (showcaseArgument && this.shouldAddCardContainer()) {
			const codeEl = DomHelpers.createElement(containerEl, 'code', { class: 'mb-none' });
			const linkEl = DomHelpers.createElement(codeEl, 'a', {
				text: this.declarationString,
				class: 'mb-no-link',
			});
			linkEl.href = DocsUtils.linkToInputField(this.declaration.inputFieldType);
		}
	}

	private createInputField(): void {
		if (!this.errorCollection.hasErrors()) {
			try {
				this.inputField = this.mb.inputFieldFactory.createInputField(this);
			} catch (e) {
				this.errorCollection.add(e);
			}
		}

		if (!this.errorCollection.hasErrors() && !this.inputField) {
			this.errorCollection.add(
				new MetaBindInternalError({
					errorLevel: ErrorLevel.CRITICAL,
					effect: "can't render input field",
					cause: 'input field is undefined',
				}),
			);
		}
	}

	private createErrorIndicator(containerEl: HTMLElement): void {
		this.mb.internal.createErrorIndicator(containerEl, {
			errorCollection: this.errorCollection,
			errorText:
				'Errors caused the creation of the field to fail. Sometimes one error only occurs because of another.',
			warningText:
				'Warnings will not cause the creation of a field to fail, but they indicate that a part of the declaration was invalid or uses deprecated functionality.',
			code: this.declarationString,
		});
	}

	protected onMount(targetEl: HTMLElement): void {
		MB_DEBUG && console.debug('meta-bind | InputFieldMountable >> mount', this.declaration);
		super.onMount(targetEl);

		DomHelpers.empty(targetEl);
		DomHelpers.addClass(targetEl, 'mb-input');

		this.createInputField();

		if (this.errorCollection.hasErrors()) {
			this.createErrorIndicator(targetEl);
			return;
		}

		const containerEl = this.createContainer(targetEl);

		this.createErrorIndicator(containerEl);

		const wrapperEl = DomHelpers.createElement(containerEl, 'div', { class: 'mb-input-wrapper' });
		this.inputField?.mount(wrapperEl);

		const classArguments = this.getArguments(InputFieldArgumentType.CLASS);
		for (const classArgument of classArguments) {
			DomHelpers.addClasses(wrapperEl, classArgument.value);
		}

		DomHelpers.addClass(wrapperEl, `mb-input-type-${this.declaration.inputFieldType}`);

		if (this.renderChildType === RenderChildType.BLOCK) {
			DomHelpers.addClass(targetEl, 'mb-input-block');
		} else {
			DomHelpers.addClass(targetEl, 'mb-input-inline');
		}

		this.addShowcase(containerEl);
	}

	protected onUnmount(targetEl: HTMLElement): void {
		MB_DEBUG && console.debug('meta-bind | InputFieldMountable >> unmount', this.declaration);
		super.onUnmount(targetEl);

		this.inputField?.unmount();

		showUnloadedMessage(targetEl, 'input field');
	}
}

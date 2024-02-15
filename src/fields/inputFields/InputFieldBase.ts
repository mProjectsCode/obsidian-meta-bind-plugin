import { type IPlugin } from '../../IPlugin';
import { InputFieldArgumentType, InputFieldType, RenderChildType } from '../../config/FieldConfigs';
import { ErrorCollection } from '../../utils/errors/ErrorCollection';
import { DomHelpers, showUnloadedMessage } from '../../utils/Utils';
import { type InputFieldArgumentMapType } from '../fieldArguments/inputFieldArguments/InputFieldArgumentFactory';
import { type BindTargetDeclaration } from '../../parsers/bindTargetParser/BindTargetDeclaration';
import type { InputField } from './InputFieldFactory';
import { type InputFieldDeclaration } from '../../parsers/inputFieldParser/InputFieldDeclaration';
import { ErrorLevel, MetaBindInternalError } from '../../utils/errors/MetaBindErrors';
import { DocsUtils } from '../../utils/DocsUtils';
import type { IFieldBase } from '../IFieldBase';

export interface IInputFieldBase extends IFieldBase {
	getBindTarget(): BindTargetDeclaration | undefined;

	hasArgument<T extends InputFieldArgumentType>(name: T): boolean;

	getArguments<T extends InputFieldArgumentType>(name: T): InputFieldArgumentMapType<T>[];

	getArgument<T extends InputFieldArgumentType>(name: T): InputFieldArgumentMapType<T> | undefined;
}

export class InputFieldBase implements IInputFieldBase {
	readonly plugin: IPlugin;
	filePath: string;
	uuid: string;
	renderChildType: RenderChildType;
	errorCollection: ErrorCollection;
	containerEl: HTMLElement;

	inputField: InputField | undefined;
	declarationString: string | undefined;
	declaration: InputFieldDeclaration;

	constructor(
		plugin: IPlugin,
		uuid: string,
		filePath: string,
		containerEl: HTMLElement,
		renderChildType: RenderChildType,
		declaration: InputFieldDeclaration,
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

	public getFilePath(): string {
		return this.filePath;
	}

	public getUuid(): string {
		return this.uuid;
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
				this.inputField = this.plugin.api.inputFieldFactory.createInputField(
					this.declaration.inputFieldType,
					this.renderChildType,
					this,
				);
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
		console.debug('meta-bind | InputFieldBase >> mount', this);

		DomHelpers.empty(this.containerEl);
		DomHelpers.addClass(this.containerEl, 'mb-input');

		this.createInputField();

		if (this.errorCollection.hasErrors()) {
			this.createErrorIndicator(this.containerEl);
			return;
		}

		const containerEl = this.createContainer(this.containerEl);

		this.createErrorIndicator(containerEl);

		const wrapperEl = DomHelpers.createElement(containerEl, 'div', { class: 'mb-input-wrapper' });
		this.inputField?.mount(wrapperEl);

		const classArguments = this.getArguments(InputFieldArgumentType.CLASS);
		for (const classArgument of classArguments) {
			DomHelpers.addClasses(wrapperEl, classArgument.value);
		}

		DomHelpers.addClass(wrapperEl, `mb-input-type-${this.declaration.inputFieldType}`);

		if (this.renderChildType === RenderChildType.BLOCK) {
			DomHelpers.addClass(this.containerEl, 'mb-input-block');
		} else {
			DomHelpers.addClass(this.containerEl, 'mb-input-inline');
		}

		this.addShowcase(containerEl);
	}

	public destroy(): void {
		console.debug('meta-bind | InputFieldBase >> destroy', this);

		this.inputField?.destroy();

		showUnloadedMessage(this.containerEl, 'input field');
	}
}

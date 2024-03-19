import { type IPlugin } from 'packages/core/src/IPlugin';
import { FieldBase } from 'packages/core/src/fields/FieldBase';
import { ButtonGroupField } from 'packages/core/src/fields/button/ButtonGroupField';
import { DomHelpers, showUnloadedMessage } from 'packages/core/src/utils/Utils';
import { ErrorCollection } from 'packages/core/src/utils/errors/ErrorCollection';
import { type ButtonGroupDeclaration } from 'packages/core/src/parsers/ButtonParser';
import { type NotePosition, type RenderChildType } from 'packages/core/src/config/FieldConfigs';

export class ButtonGroupBase extends FieldBase {
	errorCollection: ErrorCollection;

	declaration: ButtonGroupDeclaration;
	buttonField: ButtonGroupField | undefined;

	renderChildType: RenderChildType;
	position: NotePosition | undefined;

	constructor(
		plugin: IPlugin,
		uuid: string,
		filePath: string,
		declaration: ButtonGroupDeclaration,
		renderChildType: RenderChildType,
		position: NotePosition | undefined,
	) {
		super(plugin, uuid, filePath);

		this.declaration = declaration;

		this.errorCollection = new ErrorCollection(this.getUuid());
		this.errorCollection.merge(declaration.errorCollection);

		this.renderChildType = renderChildType;
		this.position = position;
	}

	protected onMount(targetEl: HTMLElement): void {
		console.debug('meta-bind | InlineButtonBase >> mount', this.declaration);

		DomHelpers.removeAllClasses(targetEl);

		if (!this.declaration.errorCollection.isEmpty()) {
			this.plugin.internal.createErrorIndicator(targetEl, {
				errorCollection: this.declaration.errorCollection,
				errorText:
					'Errors caused the creation of the field to fail. Sometimes one error only occurs because of another.',
				warningText:
					'Warnings will not cause the creation of a field to fail, but they indicate that a part of the declaration was invalid or uses deprecated functionality.',
				code: this.declaration.declarationString,
			});
			return;
		}

		this.buttonField = new ButtonGroupField(
			this.plugin,
			this.declaration.referencedButtonIds,
			this.getFilePath(),
			this.renderChildType,
			this.position,
		);
		this.buttonField.mount(targetEl);
	}

	protected onUnmount(targetEl: HTMLElement): void {
		console.debug('meta-bind | InlineButtonBase >> destroy', this.declaration);

		this.buttonField?.unmount();

		showUnloadedMessage(targetEl, 'inline button');
	}
}

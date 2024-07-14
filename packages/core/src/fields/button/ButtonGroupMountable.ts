import type { NotePosition, RenderChildType } from 'packages/core/src/config/APIConfigs';
import { ButtonGroupField } from 'packages/core/src/fields/button/ButtonGroupField';
import { FieldMountable } from 'packages/core/src/fields/FieldMountable';
import type { IPlugin } from 'packages/core/src/IPlugin';
import type { ButtonGroupDeclaration } from 'packages/core/src/parsers/ButtonParser';
import { ErrorCollection } from 'packages/core/src/utils/errors/ErrorCollection';
import { DomHelpers, showUnloadedMessage } from 'packages/core/src/utils/Utils';

export class ButtonGroupMountable extends FieldMountable {
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
		console.debug('meta-bind | ButtonGroupMountable >> mount', this.declaration);
		super.onMount(targetEl);

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
		console.debug('meta-bind | ButtonGroupMountable >> destroy', this.declaration);
		super.onUnmount(targetEl);

		this.buttonField?.unmount();

		showUnloadedMessage(targetEl, 'inline button');
	}
}

import { type IPlugin } from 'packages/core/src/IPlugin';
import { FieldMountable } from 'packages/core/src/fields/FieldMountable';
import { ButtonField } from 'packages/core/src/fields/button/ButtonField';
import { DomHelpers, showUnloadedMessage } from 'packages/core/src/utils/Utils';
import { ErrorCollection } from 'packages/core/src/utils/errors/ErrorCollection';
import { type ButtonDeclaration } from 'packages/core/src/parsers/ButtonParser';
import { type NotePosition, RenderChildType } from 'packages/core/src/config/FieldConfigs';

export class ButtonMountable extends FieldMountable {
	errorCollection: ErrorCollection;

	declaration: ButtonDeclaration;
	position: NotePosition | undefined;
	buttonField: ButtonField | undefined;
	isPreview: boolean;

	constructor(
		plugin: IPlugin,
		uuid: string,
		filePath: string,
		declaration: ButtonDeclaration,
		position: NotePosition | undefined,
		isPreview: boolean,
	) {
		super(plugin, uuid, filePath);

		this.declaration = declaration;
		this.position = position;
		this.isPreview = isPreview;

		this.errorCollection = new ErrorCollection(this.getUuid());
	}

	protected onMount(targetEl: HTMLElement): void {
		console.debug('meta-bind | ButtonMountable >> mount', this.declaration.declarationString);
		super.onMount(targetEl);

		DomHelpers.removeAllClasses(targetEl);

		if (!this.declaration.config || !this.declaration.errorCollection.isEmpty()) {
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

		this.buttonField = new ButtonField(
			this.plugin,
			this.declaration.config,
			this.getFilePath(),
			RenderChildType.BLOCK,
			this.position,
			this.isPreview,
		);
		this.buttonField.mount(targetEl);
	}

	protected onUnmount(targetEl: HTMLElement): void {
		console.debug('meta-bind | ButtonMountable >> destroy', this.declaration.declarationString);
		super.onUnmount(targetEl);

		this.buttonField?.unmount();

		showUnloadedMessage(targetEl, 'button');
	}
}

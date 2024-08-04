import type { NotePosition } from 'packages/core/src/config/APIConfigs';
import { RenderChildType } from 'packages/core/src/config/APIConfigs';
import { ButtonField } from 'packages/core/src/fields/button/ButtonField';
import { FieldMountable } from 'packages/core/src/fields/FieldMountable';
import type { IPlugin } from 'packages/core/src/IPlugin';
import type { ButtonDeclaration } from 'packages/core/src/parsers/ButtonParser';
import { ErrorCollection } from 'packages/core/src/utils/errors/ErrorCollection';
import { DomHelpers, showUnloadedMessage } from 'packages/core/src/utils/Utils';

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
		this.errorCollection.merge(declaration.errorCollection);
	}

	protected onMount(targetEl: HTMLElement): void {
		MB_DEBUG && console.debug('meta-bind | ButtonMountable >> mount', this.declaration.declarationString);
		super.onMount(targetEl);

		DomHelpers.removeAllClasses(targetEl);

		if (this.declaration.config && this.declaration.errorCollection.isEmpty()) {
			try {
				this.buttonField = new ButtonField(
					this.plugin,
					this.declaration.config,
					this.getFilePath(),
					RenderChildType.BLOCK,
					this.position,
					false,
					this.isPreview,
				);
				this.buttonField.mount(targetEl);
			} catch (e) {
				this.errorCollection.add(e);
				this.renderErrorIndicator(targetEl);
			}
		} else {
			this.renderErrorIndicator(targetEl);
		}
	}

	private renderErrorIndicator(targetEl: HTMLElement): void {
		this.plugin.internal.createErrorIndicator(targetEl, {
			errorCollection: this.errorCollection,
			errorText:
				'Errors caused the creation of the field to fail. Sometimes one error only occurs because of another.',
			warningText:
				'Warnings will not cause the creation of a field to fail, but they indicate that a part of the declaration was invalid or uses deprecated functionality.',
			code: this.declaration.declarationString,
		});
	}

	protected onUnmount(targetEl: HTMLElement): void {
		MB_DEBUG && console.debug('meta-bind | ButtonMountable >> destroy', this.declaration.declarationString);
		super.onUnmount(targetEl);

		this.buttonField?.unmount();

		showUnloadedMessage(targetEl, 'button');
	}
}

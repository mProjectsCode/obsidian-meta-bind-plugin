import { type IPlugin } from 'packages/core/src/IPlugin';
import { FieldBase } from 'packages/core/src/fields/FieldBase';
import { InlineButtonField } from 'packages/core/src/fields/button/InlineButtonField';
import { DomHelpers, showUnloadedMessage } from 'packages/core/src/utils/Utils';
import { ErrorCollection } from 'packages/core/src/utils/errors/ErrorCollection';
import { type InlineButtonDeclaration } from 'packages/core/src/parsers/ButtonParser';

export class InlineButtonBase extends FieldBase {
	errorCollection: ErrorCollection;

	declaration: InlineButtonDeclaration;
	buttonField: InlineButtonField | undefined;

	constructor(plugin: IPlugin, uuid: string, filePath: string, declaration: InlineButtonDeclaration) {
		super(plugin, uuid, filePath);

		this.declaration = declaration;

		this.errorCollection = new ErrorCollection(this.getUuid());
		this.errorCollection.merge(declaration.errorCollection);
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

		this.buttonField = new InlineButtonField(this.plugin, this.declaration.referencedButtonIds, this.getFilePath());
		this.buttonField.mount(targetEl);
	}

	protected onUnmount(targetEl: HTMLElement): void {
		console.debug('meta-bind | InlineButtonBase >> destroy', this.declaration);

		this.buttonField?.unmount();

		showUnloadedMessage(targetEl, 'inline button');
	}
}

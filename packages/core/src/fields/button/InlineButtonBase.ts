import { type IPlugin } from 'packages/core/src/IPlugin';
import { ErrorCollection } from 'packages/core/src/utils/errors/ErrorCollection';
import { InlineButtonField } from 'packages/core/src/fields/button/InlineButtonField';
import { DomHelpers, showUnloadedMessage } from 'packages/core/src/utils/Utils';
import { FieldBase } from 'packages/core/src/fields/IFieldBase';

export class InlineButtonBase extends FieldBase {
	errorCollection: ErrorCollection;

	declarationString: string;
	buttonField: InlineButtonField | undefined;

	constructor(plugin: IPlugin, uuid: string, filePath: string, declaration: string) {
		super(plugin, uuid, filePath);

		this.declarationString = declaration;

		this.errorCollection = new ErrorCollection(this.getUuid());
	}

	protected onMount(targetEl: HTMLElement): void {
		console.debug('meta-bind | InlineButtonBase >> mount', this.declarationString);

		DomHelpers.removeAllClasses(targetEl);
		this.buttonField = new InlineButtonField(this.plugin, this.declarationString, this.getFilePath());

		try {
			this.buttonField.mount(targetEl);
		} catch (e) {
			this.errorCollection.add(e);

			this.plugin.internal.createErrorIndicator(targetEl, {
				errorCollection: this.errorCollection,
				errorText:
					'Errors caused the creation of the field to fail. Sometimes one error only occurs because of another.',
				warningText:
					'Warnings will not cause the creation of a field to fail, but they indicate that a part of the declaration was invalid or uses deprecated functionality.',
				code: this.declarationString,
			});
		}
	}

	protected onUnmount(targetEl: HTMLElement): void {
		console.debug('meta-bind | InlineButtonBase >> destroy', this.declarationString);

		this.buttonField?.unmount();

		showUnloadedMessage(targetEl, 'inline button');
	}
}

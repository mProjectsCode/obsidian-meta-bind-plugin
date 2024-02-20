import { type IPlugin } from 'packages/core/src/IPlugin';
import { FieldBase } from 'packages/core/src/fields/FieldBase';
import { ButtonField } from 'packages/core/src/fields/button/ButtonField';
import { DomHelpers, showUnloadedMessage } from 'packages/core/src/utils/Utils';
import { ErrorCollection } from 'packages/core/src/utils/errors/ErrorCollection';

export class ButtonBase extends FieldBase {
	errorCollection: ErrorCollection;

	declarationString: string;
	buttonField: ButtonField | undefined;
	isPreview: boolean;

	constructor(plugin: IPlugin, uuid: string, filePath: string, declaration: string, isPreview: boolean) {
		super(plugin, uuid, filePath);

		this.declarationString = declaration;
		this.isPreview = isPreview;

		this.errorCollection = new ErrorCollection(this.getUuid());
	}

	protected onMount(targetEl: HTMLElement): void {
		console.debug('meta-bind | ButtonBase >> mount', this.declarationString);

		DomHelpers.removeAllClasses(targetEl);

		const yamlContent = this.plugin.internal.parseYaml(this.declarationString);

		this.buttonField = new ButtonField(this.plugin, yamlContent, this.getFilePath(), false, this.isPreview);

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
		console.debug('meta-bind | ButtonBase >> destroy', this.declarationString);

		this.buttonField?.unmount();

		showUnloadedMessage(targetEl, 'button');
	}
}

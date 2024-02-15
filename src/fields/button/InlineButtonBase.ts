import { type IFieldBase } from '../IFieldBase';
import { type IPlugin } from '../../IPlugin';
import { ErrorCollection } from '../../utils/errors/ErrorCollection';
import { InlineButtonField } from './InlineButtonField';
import { showUnloadedMessage } from '../../utils/Utils';

export type IInlineButtonBase = IFieldBase;

export class InlineButtonBase implements IInlineButtonBase {
	readonly plugin: IPlugin;
	filePath: string;
	uuid: string;
	errorCollection: ErrorCollection;
	containerEl: HTMLElement;

	declarationString: string;
	buttonField: InlineButtonField | undefined;

	constructor(plugin: IPlugin, uuid: string, filePath: string, containerEl: HTMLElement, declaration: string) {
		this.plugin = plugin;
		this.filePath = filePath;
		this.containerEl = containerEl;
		this.declarationString = declaration;

		this.uuid = uuid;
		this.errorCollection = new ErrorCollection(this.uuid);
	}

	getUuid(): string {
		return this.uuid;
	}

	getFilePath(): string {
		return this.filePath;
	}

	mount(): void {
		console.debug('meta-bind | InlineButtonBase >> mount');

		this.containerEl.className = '';
		this.buttonField = new InlineButtonField(this.plugin, this.declarationString, this.filePath);

		try {
			this.buttonField.mount(this.containerEl);
		} catch (e) {
			this.errorCollection.add(e);

			this.plugin.internal.createErrorIndicator(this.containerEl, {
				errorCollection: this.errorCollection,
				errorText:
					'Errors caused the creation of the field to fail. Sometimes one error only occurs because of another.',
				warningText:
					'Warnings will not cause the creation of a field to fail, but they indicate that a part of the declaration was invalid or uses deprecated functionality.',
				code: this.declarationString,
			});
		}
	}

	destroy(): void {
		console.debug('meta-bind | InlineButtonBase >> destroy');

		this.buttonField?.unmount();

		showUnloadedMessage(this.containerEl, 'inline button');
	}
}

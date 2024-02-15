import { type IFieldBase } from '../IFieldBase';
import { type IPlugin } from '../../IPlugin';
import { ErrorCollection } from '../../utils/errors/ErrorCollection';
import { showUnloadedMessage } from '../../utils/Utils';
import { ButtonField } from './ButtonField';
import { parseYaml } from 'obsidian';

export type IButtonBase = IFieldBase;

export class ButtonBase implements IButtonBase {
	readonly plugin: IPlugin;
	filePath: string;
	uuid: string;
	errorCollection: ErrorCollection;
	containerEl: HTMLElement;

	declarationString: string;
	buttonField: ButtonField | undefined;
	isPreview: boolean;

	constructor(
		plugin: IPlugin,
		uuid: string,
		filePath: string,
		containerEl: HTMLElement,
		declaration: string,
		isPreview: boolean,
	) {
		this.plugin = plugin;
		this.filePath = filePath;
		this.containerEl = containerEl;
		this.declarationString = declaration;
		this.isPreview = isPreview;

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
		console.debug('meta-bind | ButtonBase >> mount');

		this.containerEl.className = '';

		const yamlContent = parseYaml(this.declarationString) as unknown;

		this.buttonField = new ButtonField(this.plugin, yamlContent, this.filePath, false, this.isPreview);

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
		console.debug('meta-bind | ButtonBase >> destroy');

		this.buttonField?.unmount();

		showUnloadedMessage(this.containerEl, 'button');
	}
}

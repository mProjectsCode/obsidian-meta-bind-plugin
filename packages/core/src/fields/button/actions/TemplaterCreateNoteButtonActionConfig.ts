import type {
	ButtonClickContext,
	ButtonConfig,
	ButtonContext,
	TemplaterCreateNoteButtonAction,
} from 'packages/core/src/config/ButtonConfig';
import { ButtonActionType } from 'packages/core/src/config/ButtonConfig';
import { AbstractButtonActionConfig } from 'packages/core/src/fields/button/AbstractButtonActionConfig';
import type { IPlugin } from 'packages/core/src/IPlugin';
import { ensureFileExtension, joinPath } from 'packages/core/src/utils/Utils';

export class TemplaterCreateNoteButtonActionConfig extends AbstractButtonActionConfig<TemplaterCreateNoteButtonAction> {
	constructor(plugin: IPlugin) {
		super(ButtonActionType.TEMPLATER_CREATE_NOTE, plugin);
	}

	async run(
		_config: ButtonConfig | undefined,
		action: TemplaterCreateNoteButtonAction,
		_filePath: string,
		_context: ButtonContext,
		_click: ButtonClickContext,
	): Promise<void> {
		if (action.openIfAlreadyExists && action.fileName) {
			const filePath = ensureFileExtension(joinPath(action.folderPath ?? '', action.fileName), 'md');
			// if the file already exists, open it in the same tab
			if (await this.plugin.internal.file.exists(filePath)) {
				this.plugin.internal.file.open(filePath, '', false);
				return;
			}
		}

		await this.plugin.internal.createNoteWithTemplater(
			action.templateFile,
			action.folderPath,
			action.fileName,
			action.openNote,
		);
	}

	create(): Required<TemplaterCreateNoteButtonAction> {
		return {
			type: ButtonActionType.TEMPLATER_CREATE_NOTE,
			templateFile: '',
			folderPath: '/',
			fileName: '',
			openNote: true,
			openIfAlreadyExists: false,
		};
	}

	getActionLabel(): string {
		return 'Create a new note using Templater';
	}
}

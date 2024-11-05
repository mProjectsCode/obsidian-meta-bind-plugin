import type {
	ButtonClickContext,
	ButtonConfig,
	ButtonContext,
	CreateNoteButtonAction,
} from 'packages/core/src/config/ButtonConfig';
import { ButtonActionType } from 'packages/core/src/config/ButtonConfig';
import { AbstractButtonActionConfig } from 'packages/core/src/fields/button/AbstractButtonActionConfig';
import type { IPlugin } from 'packages/core/src/IPlugin';
import { ensureFileExtension, joinPath } from 'packages/core/src/utils/Utils';

export class CreateNoteButtonActionConfig extends AbstractButtonActionConfig<CreateNoteButtonAction> {
	constructor(plugin: IPlugin) {
		super(ButtonActionType.CREATE_NOTE, plugin);
	}

	async run(
		_config: ButtonConfig | undefined,
		action: CreateNoteButtonAction,
		_filePath: string,
		_context: ButtonContext,
		_click: ButtonClickContext,
	): Promise<void> {
		if (action.openIfAlreadyExists) {
			const filePath = ensureFileExtension(joinPath(action.folderPath ?? '', action.fileName), 'md');
			// if the file already exists, open it in the same tab
			if (await this.plugin.internal.file.exists(filePath)) {
				this.plugin.internal.file.open(filePath, '', false);
				return;
			}
		}

		await this.plugin.internal.file.create(
			action.folderPath ?? '',
			action.fileName,
			'md',
			action.openNote ?? false,
		);
	}

	create(): Required<CreateNoteButtonAction> {
		return {
			type: ButtonActionType.CREATE_NOTE,
			folderPath: '/',
			fileName: 'Untitled',
			openNote: true,
			openIfAlreadyExists: false,
		};
	}

	getActionLabel(): string {
		return 'Create a new note';
	}
}

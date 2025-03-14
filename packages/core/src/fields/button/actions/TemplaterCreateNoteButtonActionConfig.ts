import type { MetaBind } from 'packages/core/src';
import type {
	ButtonClickContext,
	ButtonConfig,
	ButtonContext,
	TemplaterCreateNoteButtonAction,
} from 'packages/core/src/config/ButtonConfig';
import { ButtonActionType } from 'packages/core/src/config/ButtonConfig';
import { AbstractButtonActionConfig } from 'packages/core/src/fields/button/AbstractButtonActionConfig';
import { ensureFileExtension, joinPath } from 'packages/core/src/utils/Utils';

export class TemplaterCreateNoteButtonActionConfig extends AbstractButtonActionConfig<TemplaterCreateNoteButtonAction> {
	constructor(mb: MetaBind) {
		super(ButtonActionType.TEMPLATER_CREATE_NOTE, mb);
	}

	async run(
		_config: ButtonConfig | undefined,
		action: TemplaterCreateNoteButtonAction,
		_filePath: string,
		_context: ButtonContext,
		click: ButtonClickContext,
	): Promise<void> {
		if (action.openIfAlreadyExists && action.fileName) {
			const filePath = ensureFileExtension(joinPath(action.folderPath ?? '', action.fileName), 'md');
			// if the file already exists, open it in the same tab
			if (await this.mb.file.exists(filePath)) {
				await this.mb.file.open(filePath, '', false);
				return;
			}
		}

		await this.mb.internal.createNoteWithTemplater(
			action.templateFile,
			action.folderPath,
			action.fileName,
			action.openNote,
			click.openInNewTab(),
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

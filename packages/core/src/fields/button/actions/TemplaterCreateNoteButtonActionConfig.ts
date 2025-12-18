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
import moment from 'moment';

export class TemplaterCreateNoteButtonActionConfig extends AbstractButtonActionConfig<TemplaterCreateNoteButtonAction> {
	constructor(mb: MetaBind) {
		super(ButtonActionType.TEMPLATER_CREATE_NOTE, mb);
	}

	private processDateFormatPlaceholders(value: string | undefined): string | undefined {
		if (!value) {
			return value;
		}

		// Match {...} patterns and replace with formatted dates
		// Uses a regex to find all {format} patterns
		const placeholderRegex = /\{([^}]+)\}/g;

		return value.replace(placeholderRegex, (match, format) => {
			try {
				// Format the current date/time using the captured format string
				return moment().format(format);
			} catch (error) {
				// If formatting fails, return the original placeholder
				return match;
			}
		});
	}

	async run(
		_config: ButtonConfig | undefined,
		action: TemplaterCreateNoteButtonAction,
		_filePath: string,
		_context: ButtonContext,
		click: ButtonClickContext,
	): Promise<void> {
		const processedFileName = this.processDateFormatPlaceholders(action.fileName);
		const processedFolderPath = this.processDateFormatPlaceholders(action.folderPath);

		if (action.openIfAlreadyExists && processedFileName) {
			const filePath = ensureFileExtension(joinPath(processedFolderPath ?? '', processedFileName), 'md');
			// if the file already exists, open it in the same tab
			if (await this.mb.file.exists(filePath)) {
				await this.mb.file.open(filePath, '', false);
				return;
			}
		}

		await this.mb.internal.createNoteWithTemplater(
			action.templateFile,
			processedFolderPath,
			processedFileName,
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

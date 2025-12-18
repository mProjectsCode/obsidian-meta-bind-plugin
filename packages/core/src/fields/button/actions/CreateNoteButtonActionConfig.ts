import type { MetaBind } from 'packages/core/src';
import type {
	ButtonClickContext,
	ButtonConfig,
	ButtonContext,
	CreateNoteButtonAction,
} from 'packages/core/src/config/ButtonConfig';
import { ButtonActionType } from 'packages/core/src/config/ButtonConfig';
import { AbstractButtonActionConfig } from 'packages/core/src/fields/button/AbstractButtonActionConfig';
import { ensureFileExtension, joinPath } from 'packages/core/src/utils/Utils';
import moment from 'moment';

export class CreateNoteButtonActionConfig extends AbstractButtonActionConfig<CreateNoteButtonAction> {
	constructor(mb: MetaBind) {
		super(ButtonActionType.CREATE_NOTE, mb);
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
		action: CreateNoteButtonAction,
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

		await this.mb.file.create(
			processedFolderPath ?? '',
			processedFileName ?? 'Untitled',
			'md',
			action.openNote ?? false,
			click.openInNewTab(),
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

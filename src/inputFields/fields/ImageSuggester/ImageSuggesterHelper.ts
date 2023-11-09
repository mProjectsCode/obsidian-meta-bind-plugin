import { SuggesterOption } from '../Suggester/SuggesterHelper';
import { type OptionInputFieldArgument } from '../../../fieldArguments/inputFieldArguments/arguments/OptionInputFieldArgument';
import { type OptionQueryInputFieldArgument } from '../../../fieldArguments/inputFieldArguments/arguments/OptionQueryInputFieldArgument';
import { ErrorLevel, MetaBindArgumentError } from '../../../utils/errors/MetaBindErrors';
import { Notice, TFile, TFolder } from 'obsidian';
import type MetaBindPlugin from '../../../main';
import { ImageSuggesterInputModal } from './ImageSuggesterInputModal';
import { type ImageSuggesterIPF } from './ImageSuggesterIPF';
import { InputFieldArgumentType } from '../../../parsers/GeneralConfigs';
import { stringifyLiteral } from '../../../utils/Literal';

function recSearchFolder(folder: TFolder): SuggesterOption<string>[] {
	const ret = [];
	for (const child of folder.children) {
		if (child instanceof TFile && isImageExtension(child.extension)) {
			ret.push(new SuggesterOption(child.path, child.name));
		}
		if (child instanceof TFolder) {
			ret.push(...recSearchFolder(child));
		}
	}
	return ret;
}

export function getImageSuggesterOptions(
	optionArgs: OptionInputFieldArgument[],
	optionQueryArgs: OptionQueryInputFieldArgument[],
	plugin: MetaBindPlugin,
): SuggesterOption<string>[] {
	const options: SuggesterOption<string>[] = [];

	for (const optionQueryArg of optionQueryArgs) {
		let folderPathString: string = optionQueryArg.value;
		if (folderPathString.startsWith('"') && folderPathString.endsWith('"')) {
			folderPathString = folderPathString.substring(1, folderPathString.length - 1);
		} else {
			const error = new MetaBindArgumentError({
				errorLevel: ErrorLevel.ERROR,
				effect: 'failed to get suggest options',
				cause: `expected suggest option query for image suggester to start and end with double quotation marks`,
			});
			new Notice(`meta-bind | ${error.message}`);
			console.warn(error);
			continue;
		}

		const folder = plugin.app.vault.getAbstractFileByPath(folderPathString);
		if (folder == null) {
			const error = new MetaBindArgumentError({
				errorLevel: ErrorLevel.ERROR,
				effect: 'failed to get suggest options',
				cause: `expected suggest option query ${folderPathString} for image suggester to exist`,
			});
			new Notice(`meta-bind | ${error.message}`);
			console.warn(error);
			continue;
		}

		if (!(folder instanceof TFolder)) {
			const error = new MetaBindArgumentError({
				errorLevel: ErrorLevel.ERROR,
				effect: 'failed to get suggest options',
				cause: `expected suggest option query ${optionQueryArg.value} for image suggester to be a folder`,
			});
			new Notice(`meta-bind | ${error.message}`);
			console.warn(error);
			continue;
		}

		options.push(...recSearchFolder(folder));
	}

	for (const optionArg of optionArgs) {
		const imagePathString = stringifyLiteral(optionArg.value);

		if (!imagePathString) {
			const error = new MetaBindArgumentError({
				errorLevel: ErrorLevel.ERROR,
				effect: 'failed to get suggest options',
				cause: `expected suggest option ${optionArg.value} to be truthy`,
			});
			new Notice(`meta-bind | ${error.message}`);
			console.warn(error);
			continue;
		}

		const imageFile = plugin.app.vault.getAbstractFileByPath(imagePathString);

		if (!imageFile) {
			const error = new MetaBindArgumentError({
				errorLevel: ErrorLevel.ERROR,
				effect: 'failed to get suggest options',
				cause: `expected suggest option ${optionArg.value} for image suggester to exist`,
			});
			new Notice(`meta-bind | ${error.message}`);
			console.warn(error);
			continue;
		}

		if (!(imageFile instanceof TFile)) {
			const error = new MetaBindArgumentError({
				errorLevel: ErrorLevel.ERROR,
				effect: 'failed to get suggest options',
				cause: `expected suggest option ${optionArg.value} for image suggester to be a file`,
			});
			new Notice(`meta-bind | ${error.message}`);
			console.warn(error);
			continue;
		}

		if (!isImageExtension(imageFile.extension)) {
			const error = new MetaBindArgumentError({
				errorLevel: ErrorLevel.ERROR,
				effect: 'failed to get suggest options',
				cause: `expected suggest option ${optionArg.value} for image suggester to be an image file`,
			});
			new Notice(`meta-bind | ${error.message}`);
			console.warn(error);
			continue;
		}

		options.push(new SuggesterOption(imageFile.path, imageFile.name));
	}

	return options;
}

function isImageExtension(extension: string): boolean {
	const extensions = ['apng', 'avif', 'gif', 'jpg', 'jpeg', 'jfif', 'pjpeg', 'pjp', 'png', 'svg', 'webp'];
	return extensions.contains(extension);
}

export function getImageSuggesterOptionsForInputField(inputField: ImageSuggesterIPF): SuggesterOption<string>[] {
	const optionArgs = inputField.renderChild.getArguments(InputFieldArgumentType.OPTION);
	const optionQueryArgs = inputField.renderChild.getArguments(InputFieldArgumentType.OPTION_QUERY);
	return getImageSuggesterOptions(optionArgs, optionQueryArgs, inputField.renderChild.plugin);
}

export function openImageSuggesterModalForInputField(inputField: ImageSuggesterIPF, selectCallback: (selected: string) => void): void {
	new ImageSuggesterInputModal(inputField.renderChild.plugin.app, getImageSuggesterOptionsForInputField(inputField), selectCallback).open();
}

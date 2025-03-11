import type { TAbstractFile } from 'obsidian';
import { Notice, TFile, TFolder } from 'obsidian';
import { IMAGE_FILE_EXTENSIONS } from 'packages/core/src/api/InternalAPI';
import { InputFieldArgumentType } from 'packages/core/src/config/FieldConfigs';
import type { OptionInputFieldArgument } from 'packages/core/src/fields/fieldArguments/inputFieldArguments/arguments/OptionInputFieldArgument';
import type { OptionQueryInputFieldArgument } from 'packages/core/src/fields/fieldArguments/inputFieldArguments/arguments/OptionQueryInputFieldArgument';
import type { ImageSuggesterLikeIPF } from 'packages/core/src/fields/inputFields/fields/Suggester/SuggesterHelper';
import { SuggesterOption } from 'packages/core/src/fields/inputFields/fields/Suggester/SuggesterHelper';
import { ErrorLevel, MetaBindArgumentError } from 'packages/core/src/utils/errors/MetaBindErrors';
import { stringifyLiteral } from 'packages/core/src/utils/Literal';
import type { ObsMetaBind } from 'packages/obsidian/src/main';

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
	mb: ObsMetaBind,
	optionArgs: OptionInputFieldArgument[],
	optionQueryArgs: OptionQueryInputFieldArgument[],
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

		let folder: TAbstractFile | null;
		if (folderPathString === '' || folderPathString === '.') {
			folder = mb.app.vault.getRoot();
		} else {
			folder = mb.app.vault.getAbstractFileByPath(folderPathString);
		}

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

		const imageFile = mb.app.vault.getAbstractFileByPath(imagePathString);

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
	return IMAGE_FILE_EXTENSIONS.contains(extension);
}

export function getImageSuggesterOptionsForInputField(
	mb: ObsMetaBind,
	inputField: ImageSuggesterLikeIPF,
): SuggesterOption<string>[] {
	const optionArgs = inputField.mountable.getArguments(InputFieldArgumentType.OPTION);
	const optionQueryArgs = inputField.mountable.getArguments(InputFieldArgumentType.OPTION_QUERY);
	return getImageSuggesterOptions(mb, optionArgs, optionQueryArgs);
}

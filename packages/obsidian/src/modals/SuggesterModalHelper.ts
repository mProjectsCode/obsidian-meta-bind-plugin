import type { TAbstractFile } from 'obsidian';
import { Notice, TFile, TFolder } from 'obsidian';
import type { DataArray, DataviewApi, Literal } from 'obsidian-dataview';
import { IMAGE_FILE_EXTENSIONS } from 'packages/core/src/api/InternalAPI';
import {
	InputFieldArgumentType,
	UseLinksInputFieldArgumentValue,
	AllowImagesInSuggesterInputFieldArgumentValue,
} from 'packages/core/src/config/FieldConfigs';
import type { OptionInputFieldArgument } from 'packages/core/src/fields/fieldArguments/inputFieldArguments/arguments/OptionInputFieldArgument';
import type { OptionQueryInputFieldArgument } from 'packages/core/src/fields/fieldArguments/inputFieldArguments/arguments/OptionQueryInputFieldArgument';
import { applyUseLinksArgument } from 'packages/core/src/fields/fieldArguments/inputFieldArguments/arguments/UseLinksInputFieldArgument';
import type { SuggesterLikeIFP } from 'packages/core/src/fields/inputFields/fields/Suggester/SuggesterHelper';
import { SuggesterOption } from 'packages/core/src/fields/inputFields/fields/Suggester/SuggesterHelper';
import { ErrorLevel, MetaBindArgumentError } from 'packages/core/src/utils/errors/MetaBindErrors';
import type { MBLiteral } from 'packages/core/src/utils/Literal';
import { stringifyLiteral } from 'packages/core/src/utils/Literal';
import type MetaBindPlugin from 'packages/obsidian/src/main';
import { getDataViewPluginAPI } from 'packages/obsidian/src/ObsUtils';
import { z } from 'zod';

export function getSuggesterOptions(
	plugin: MetaBindPlugin,
	filePath: string,
	optionArgs: OptionInputFieldArgument[],
	optionQueryArgs: OptionQueryInputFieldArgument[],
	useLinks: UseLinksInputFieldArgumentValue,
	allowImages: AllowImagesInSuggesterInputFieldArgumentValue,
): SuggesterOption<MBLiteral>[] {
	let options: SuggesterOption<MBLiteral>[] = [];

	if (allowImages !== AllowImagesInSuggesterInputFieldArgumentValue.FALSE) {
		options = getImageOptions(optionQueryArgs, plugin, optionArgs, useLinks);

		if (allowImages === AllowImagesInSuggesterInputFieldArgumentValue.ONLY) {
			return options;
		}
	}

	for (const suggestOptionsArgument of optionArgs) {
		options.push(new SuggesterOption<MBLiteral>(suggestOptionsArgument.value, suggestOptionsArgument.name));
	}

	if (optionQueryArgs.length > 0) {
		let dv: DataviewApi | undefined = undefined;
		try {
			dv = getDataViewPluginAPI(plugin);
		} catch (e) {
			new Notice(
				'meta-bind | Dataview needs to be installed and enabled to use suggest option queries. Check the console for more information.',
			);
			console.warn('meta-bind | failed to get dataview api', e);

			return options;
		}

		const fileValidator = z.object({
			name: z.string().min(1),
			path: z.string().min(1),
		});

		for (const suggestOptionsQueryArgument of optionQueryArgs) {
			const result: DataArray<Record<string, Literal>> = dv.pages(suggestOptionsQueryArgument.value, filePath);

			result.forEach((file: Record<string, Literal>) => {
				try {
					const dvFile = file.file as { name: string; path: string };

					if (!fileValidator.safeParse(dvFile).success) {
						return;
					}

					const link = applyUseLinksArgument(dvFile.path, dvFile.name, useLinks);
					options.push(new SuggesterOption<MBLiteral>(link, `file: ${dvFile.name}`));
				} catch (e) {
					console.warn('meta-bind | error while computing suggest options', e);
				}
			});
		}
	}

	return options;
}

function isImageExtension(extension: string): boolean {
	return IMAGE_FILE_EXTENSIONS.contains(extension);
}

function recSearchFolder(folder: TFolder, useLinks: UseLinksInputFieldArgumentValue): SuggesterOption<MBLiteral>[] {
	const ret = [];
	for (const child of folder.children) {
		if (child instanceof TFile && isImageExtension(child.extension)) {
			const link = applyUseLinksArgument(child.path, child.name, useLinks);
			ret.push(new SuggesterOption<MBLiteral>(link, `image: ${child.name}`));
		}
		if (child instanceof TFolder) {
			ret.push(...recSearchFolder(child, useLinks));
		}
	}
	return ret;
}

function getImageOptions(
	optionQueryArgs: OptionQueryInputFieldArgument[],
	plugin: MetaBindPlugin,
	optionArgs: OptionInputFieldArgument[],
	useLinks: UseLinksInputFieldArgumentValue,
): SuggesterOption<MBLiteral>[] {
	const options = [];

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
			folder = plugin.app.vault.getRoot();
		} else {
			folder = plugin.app.vault.getAbstractFileByPath(folderPathString);
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

		options.push(...recSearchFolder(folder, useLinks));
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

export function getSuggesterOptionsForInputField(
	plugin: MetaBindPlugin,
	inputField: SuggesterLikeIFP,
): SuggesterOption<MBLiteral>[] {
	const optionArgs = inputField.mountable.getArguments(InputFieldArgumentType.OPTION);
	const optionQueryArgs = inputField.mountable.getArguments(InputFieldArgumentType.OPTION_QUERY);
	const useLinksArg = inputField.mountable.getArgument(InputFieldArgumentType.USE_LINKS);
	const allowImages = inputField.mountable.getArgument(InputFieldArgumentType.INCLUDE_IMAGES);
	// in not present, we treat the use links argument as true
	return getSuggesterOptions(
		plugin,
		inputField.mountable.getFilePath(),
		optionArgs,
		optionQueryArgs,
		useLinksArg === undefined ? UseLinksInputFieldArgumentValue.TRUE : useLinksArg.value,
		allowImages === undefined ? AllowImagesInSuggesterInputFieldArgumentValue.FALSE : allowImages.value,
	);
}

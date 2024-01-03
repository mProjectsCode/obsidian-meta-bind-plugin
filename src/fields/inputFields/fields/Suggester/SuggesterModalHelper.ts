import { type MBLiteral } from '../../../../utils/Literal';
import { type DataArray, type DataviewApi, type Literal } from 'obsidian-dataview';
import { InputFieldArgumentType, UseLinksInputFieldArgumentValue } from '../../../../config/FieldConfigs';
import { type OptionInputFieldArgument } from '../../../fieldArguments/inputFieldArguments/arguments/OptionInputFieldArgument';
import { type OptionQueryInputFieldArgument } from '../../../fieldArguments/inputFieldArguments/arguments/OptionQueryInputFieldArgument';
import { Notice } from 'obsidian';
import { SuggesterInputModal } from './SuggesterInputModal';
import { type SuggesterLikeIFP, SuggesterOption } from './SuggesterHelper';
import type MetaBindPlugin from '../../../../main';
import { getDataViewPluginAPI } from '../../../../utils/ObsUtils';
import { applyUseLinksArgument } from '../../../fieldArguments/inputFieldArguments/arguments/UseLinksInputFieldArgument';
import { z } from 'zod';

export function getSuggesterOptions(
	plugin: MetaBindPlugin,
	filePath: string,
	optionArgs: OptionInputFieldArgument[],
	optionQueryArgs: OptionQueryInputFieldArgument[],
	useLinks: UseLinksInputFieldArgumentValue,
): SuggesterOption<MBLiteral>[] {
	const options: SuggesterOption<MBLiteral>[] = [];

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

export function getSuggesterOptionsForInputField(
	inputField: SuggesterLikeIFP,
	plugin: MetaBindPlugin,
): SuggesterOption<MBLiteral>[] {
	const optionArgs = inputField.base.getArguments(InputFieldArgumentType.OPTION);
	const optionQueryArgs = inputField.base.getArguments(InputFieldArgumentType.OPTION_QUERY);
	const useLinksArg = inputField.base.getArgument(InputFieldArgumentType.USE_LINKS);
	// in not present, we treat the use links argument as true
	return getSuggesterOptions(
		plugin,
		inputField.base.getFilePath(),
		optionArgs,
		optionQueryArgs,
		useLinksArg === undefined ? UseLinksInputFieldArgumentValue.TRUE : useLinksArg.value,
	);
}

export function openSuggesterModalForInputField(
	inputField: SuggesterLikeIFP,
	selectCallback: (selected: SuggesterOption<MBLiteral>) => void,
	plugin: MetaBindPlugin,
): void {
	new SuggesterInputModal(plugin.app, getSuggesterOptionsForInputField(inputField, plugin), selectCallback).open();
}

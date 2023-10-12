import { OptionInputFieldArgument } from '../../../../fieldArguments/inputFieldArguments/arguments/OptionInputFieldArgument';
import { OptionQueryInputFieldArgument } from '../../../../fieldArguments/inputFieldArguments/arguments/OptionQueryInputFieldArgument';
import { MBLiteral } from '../../../../utils/Utils';
import { DataArray, DataviewApi, getAPI, Literal } from 'obsidian-dataview';
import { Notice } from 'obsidian';
import { NewAbstractInputField } from '../../NewAbstractInputField';
import { InputFieldArgumentType } from '../../../../parsers/inputFieldParser/InputFieldConfigs';
import { UseLinksInputFieldArgument } from '../../../../fieldArguments/inputFieldArguments/arguments/UseLinksInputFieldArgument';
import { SuggesterInputModal } from './SuggesterInputModal';

export class SuggesterOption {
	value: MBLiteral;
	displayValue: string;

	constructor(value: MBLiteral, displayValue: string) {
		this.value = value;
		this.displayValue = displayValue;
	}

	valueAsString(): string {
		return this.value?.toString() ?? 'null';
	}
}

export function getSuggesterOptions(
	dv: DataviewApi | undefined,
	filePath: string,
	optionArgs: OptionInputFieldArgument[],
	optionQueryArgs: OptionQueryInputFieldArgument[],
	useLinks: boolean
): SuggesterOption[] {
	const options: SuggesterOption[] = [];

	for (const suggestOptionsArgument of optionArgs) {
		options.push(new SuggesterOption(suggestOptionsArgument.value, suggestOptionsArgument.name));
	}

	if (optionQueryArgs.length > 0) {
		if (!dv) {
			new Notice('meta-bind | dataview needs to be installed and enabled to use suggest option queries');
			return options;
		}

		for (const suggestOptionsQueryArgument of optionQueryArgs) {
			const result: DataArray<Record<string, Literal>> = dv.pages(suggestOptionsQueryArgument.value, filePath);

			result.forEach((file: Record<string, Literal>) => {
				try {
					const dvFile: any = file.file as any;

					if (useLinks) {
						options.push(new SuggesterOption(`[[${dvFile.path}|${dvFile.name}]]`, `file-link: ${dvFile.name}`));
					} else {
						// console.log(tFile);
						options.push(new SuggesterOption(dvFile.name, `file: ${dvFile.name}`));
					}
				} catch (e) {
					console.warn('meta-bind | error while computing suggest options', e);
				}
			});
		}
	}

	return options;
}

export function getSuggesterOptionsForInputField(inputField: NewAbstractInputField<any, any>): SuggesterOption[] {
	const app = inputField.renderChild.plugin.app;
	const dv = getAPI(app);
	const optionArgs = inputField.renderChild.getArguments(InputFieldArgumentType.OPTION) as OptionInputFieldArgument[];
	const optionQueryArgs = inputField.renderChild.getArguments(InputFieldArgumentType.OPTION_QUERY) as OptionQueryInputFieldArgument[];
	const useLinksArgs = inputField.renderChild.getArgument(InputFieldArgumentType.USE_LINKS) as UseLinksInputFieldArgument;
	// in not present, we treat the use links argument as true
	return getSuggesterOptions(dv, inputField.renderChild.filePath, optionArgs, optionQueryArgs, useLinksArgs === undefined || useLinksArgs.value);
}

export function openSuggesterModalForInputField(inputField: NewAbstractInputField<any, any>, selectCallback: (selected: SuggesterOption) => void): void {
	new SuggesterInputModal(inputField.renderChild.plugin.app, getSuggesterOptionsForInputField(inputField), selectCallback).open();
}

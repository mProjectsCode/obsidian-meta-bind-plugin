import { type InputFieldArgumentConfig, InputFieldArgumentConfigs } from 'packages/core/src/config/FieldConfigs';
import { AbstractInputFieldArgument } from 'packages/core/src/fields/fieldArguments/inputFieldArguments/AbstractInputFieldArgument';
import { type ParsingResultNode } from 'packages/core/src/parsers/nomParsers/GeneralNomParsers';

export class OptionQueryInputFieldArgument extends AbstractInputFieldArgument {
	value: string = '';

	_parseValue(value: ParsingResultNode[]): void {
		this.value = value[0].value;
	}

	public getConfig(): InputFieldArgumentConfig {
		return InputFieldArgumentConfigs.optionQuery;
	}
}

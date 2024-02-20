import { AbstractInputFieldArgument } from 'packages/core/src/fields/fieldArguments/inputFieldArguments/AbstractInputFieldArgument';
import { type ParsingResultNode } from 'packages/core/src/parsers/nomParsers/GeneralNomParsers';
import { type InputFieldArgumentConfig, InputFieldArgumentConfigs } from 'packages/core/src/config/FieldConfigs';
import { type MBLiteral, parseLiteral } from 'packages/core/src/utils/Literal';

export class OptionInputFieldArgument extends AbstractInputFieldArgument {
	value: MBLiteral = '';
	name: string = '';

	_parseValue(value: ParsingResultNode[]): void {
		if (value.length === 1) {
			this.value = parseLiteral(value[0].value);
			this.name = value[0].value;
		} else if (value.length === 2) {
			this.value = parseLiteral(value[0].value);
			this.name = value[1].value;
		}
	}

	public getConfig(): InputFieldArgumentConfig {
		return InputFieldArgumentConfigs.option;
	}
}

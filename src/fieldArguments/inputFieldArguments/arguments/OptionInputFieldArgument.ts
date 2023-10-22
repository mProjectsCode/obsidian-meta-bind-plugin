import { AbstractInputFieldArgument } from '../AbstractInputFieldArgument';
import { type MBLiteral, parseLiteral } from '../../../utils/Utils';
import { type InputFieldArgumentConfig, InputFieldArgumentConfigs } from '../../../parsers/inputFieldParser/InputFieldConfigs';
import { type ParsingResultNode } from '../../../parsers/nomParsers/GeneralParsers';

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

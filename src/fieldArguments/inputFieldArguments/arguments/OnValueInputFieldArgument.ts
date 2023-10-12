import { AbstractInputFieldArgument } from '../AbstractInputFieldArgument';
import { MBLiteral, parseLiteral } from '../../../utils/Utils';
import { InputFieldArgumentConfig, InputFieldArgumentConfigs } from '../../../parsers/inputFieldParser/InputFieldConfigs';
import { ParsingResultNode } from '../../../parsers/nomParsers/GeneralParsers';

export class OnValueInputFieldArgument extends AbstractInputFieldArgument {
	value: MBLiteral = true;

	_parseValue(value: ParsingResultNode[]): void {
		this.value = parseLiteral(value[0].value);
	}

	public getConfig(): InputFieldArgumentConfig {
		return InputFieldArgumentConfigs.onValue;
	}
}

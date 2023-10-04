import { AbstractInputFieldArgument } from '../AbstractInputFieldArgument';
import { MBLiteral, parseLiteral } from '../../utils/Utils';
import { ParsingResultNode } from '../../parsers/inputFieldParser/InputFieldParser';
import { InputFieldArgumentConfig, InputFieldArgumentConfigs } from '../../inputFields/InputFieldConfigs';

export class OnValueInputFieldArgument extends AbstractInputFieldArgument {
	value: MBLiteral = true;

	_parseValue(value: ParsingResultNode[]): void {
		this.value = parseLiteral(value[0].value);
	}

	public getConfig(): InputFieldArgumentConfig {
		return InputFieldArgumentConfigs.onValue;
	}
}

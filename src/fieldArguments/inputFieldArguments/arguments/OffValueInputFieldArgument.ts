import { AbstractInputFieldArgument } from '../AbstractInputFieldArgument';
import { type MBLiteral, parseLiteral } from '../../../utils/Utils';
import { type InputFieldArgumentConfig, InputFieldArgumentConfigs } from '../../../parsers/inputFieldParser/InputFieldConfigs';
import { type ParsingResultNode } from '../../../parsers/nomParsers/GeneralParsers';

export class OffValueInputFieldArgument extends AbstractInputFieldArgument {
	value: MBLiteral = false;

	_parseValue(value: ParsingResultNode[]): void {
		this.value = parseLiteral(value[0].value);
	}

	public getConfig(): InputFieldArgumentConfig {
		return InputFieldArgumentConfigs.offValue;
	}
}

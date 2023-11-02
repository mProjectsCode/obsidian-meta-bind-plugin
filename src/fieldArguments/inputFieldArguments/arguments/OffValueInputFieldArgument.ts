import { AbstractInputFieldArgument } from '../AbstractInputFieldArgument';
import { type ParsingResultNode } from '../../../parsers/nomParsers/GeneralParsers';
import { type InputFieldArgumentConfig, InputFieldArgumentConfigs } from '../../../parsers/GeneralConfigs';
import { type MBLiteral, parseLiteral } from '../../../utils/Literal';

export class OffValueInputFieldArgument extends AbstractInputFieldArgument {
	value: MBLiteral = false;

	_parseValue(value: ParsingResultNode[]): void {
		this.value = parseLiteral(value[0].value);
	}

	public getConfig(): InputFieldArgumentConfig {
		return InputFieldArgumentConfigs.offValue;
	}
}

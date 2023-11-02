import { AbstractInputFieldArgument } from '../AbstractInputFieldArgument';
import { type ParsingResultNode } from '../../../parsers/nomParsers/GeneralParsers';
import { type InputFieldArgumentConfig, InputFieldArgumentConfigs } from '../../../parsers/GeneralConfigs';
import { type MBExtendedLiteral, parseLiteral } from '../../../utils/Literal';

export class DefaultValueInputFieldArgument extends AbstractInputFieldArgument {
	value: MBExtendedLiteral = '';

	_parseValue(value: ParsingResultNode[]): void {
		this.value = parseLiteral(value[0].value);
	}

	public getConfig(): InputFieldArgumentConfig {
		return InputFieldArgumentConfigs.defaultValue;
	}
}

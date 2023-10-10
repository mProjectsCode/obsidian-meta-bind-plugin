import { AbstractInputFieldArgument } from '../AbstractInputFieldArgument';
import { MBExtendedLiteral, parseLiteral } from '../../utils/Utils';
import { InputFieldArgumentConfig, InputFieldArgumentConfigs } from '../../inputFields/InputFieldConfigs';
import { ParsingResultNode } from '../../parsers/nomParsers/GeneralParsers';

export class DefaultValueInputFieldArgument extends AbstractInputFieldArgument {
	value: MBExtendedLiteral = '';

	_parseValue(value: ParsingResultNode[]): void {
		this.value = parseLiteral(value[0].value);
	}

	public getConfig(): InputFieldArgumentConfig {
		return InputFieldArgumentConfigs.defaultValue;
	}
}

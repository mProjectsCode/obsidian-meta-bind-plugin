import { AbstractInputFieldArgument } from '../AbstractInputFieldArgument';
import { MBLiteral, parseLiteral } from '../../utils/Utils';
import { InputFieldArgumentConfig, InputFieldArgumentConfigs } from '../../inputFields/InputFieldConfigs';
import { ParsingResultNode } from '../../parsers/nomParsers/GeneralParsers';

export class OffValueInputFieldArgument extends AbstractInputFieldArgument {
	value: MBLiteral = false;

	_parseValue(value: ParsingResultNode[]): void {
		this.value = parseLiteral(value[0].value);
	}

	public getConfig(): InputFieldArgumentConfig {
		return InputFieldArgumentConfigs.offValue;
	}
}

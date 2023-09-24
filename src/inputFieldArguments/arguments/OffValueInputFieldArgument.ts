import { AbstractInputFieldArgument } from '../AbstractInputFieldArgument';
import { MBLiteral, parseLiteral } from '../../utils/Utils';

import { ParsingResultNode } from '../../parsers/newInputFieldParser/InputFieldParser';
import { InputFieldArgumentConfig, InputFieldArgumentConfigs, InputFieldArgumentType, InputFieldType } from '../../inputFields/InputFieldConfigs';

export class OffValueInputFieldArgument extends AbstractInputFieldArgument {
	value: MBLiteral = false;

	_parseValue(value: ParsingResultNode[]): void {
		this.value = parseLiteral(value[0].value);
	}

	public getConfig(): InputFieldArgumentConfig {
		return InputFieldArgumentConfigs.offValue;
	}
}

import { AbstractInputFieldArgument } from '../AbstractInputFieldArgument';
import { ErrorLevel, MetaBindParsingError } from '../../utils/errors/MetaBindErrors';

import { ParsingResultNode } from '../../parsers/inputFieldParser/InputFieldParser';
import { InputFieldArgumentConfig, InputFieldArgumentConfigs, InputFieldArgumentType, InputFieldType } from '../../inputFields/InputFieldConfigs';

export class MinValueInputFieldArgument extends AbstractInputFieldArgument {
	value: number = 0;

	_parseValue(value: ParsingResultNode[]): void {
		this.value = Number.parseInt(value[0].value);
		if (Number.isNaN(this.value)) {
			throw new MetaBindParsingError(
				ErrorLevel.ERROR,
				'failed to set value for input field argument',
				"value of argument 'minValue' must be of type number"
			);
		}
	}

	public getConfig(): InputFieldArgumentConfig {
		return InputFieldArgumentConfigs.minValue;
	}
}

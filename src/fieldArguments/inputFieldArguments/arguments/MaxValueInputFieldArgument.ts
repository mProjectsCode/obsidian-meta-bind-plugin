import { AbstractInputFieldArgument } from '../AbstractInputFieldArgument';
import { ErrorLevel, MetaBindParsingError } from '../../../utils/errors/MetaBindErrors';
import { InputFieldArgumentConfig, InputFieldArgumentConfigs } from '../../../parsers/inputFieldParser/InputFieldConfigs';
import { ParsingResultNode } from '../../../parsers/nomParsers/GeneralParsers';

export class MaxValueInputFieldArgument extends AbstractInputFieldArgument {
	value: number = 100;

	_parseValue(value: ParsingResultNode[]): void {
		this.value = Number.parseInt(value[0].value);
		if (Number.isNaN(this.value)) {
			throw new MetaBindParsingError(
				ErrorLevel.ERROR,
				'failed to set value for input field argument',
				"value of argument 'maxValue' must be of type number"
			);
		}
	}

	public getConfig(): InputFieldArgumentConfig {
		return InputFieldArgumentConfigs.maxValue;
	}
}

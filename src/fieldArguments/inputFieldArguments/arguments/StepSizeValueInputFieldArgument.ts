import { AbstractInputFieldArgument } from '../AbstractInputFieldArgument';
import { ErrorLevel, MetaBindParsingError } from '../../../utils/errors/MetaBindErrors';
import { type ParsingResultNode } from '../../../parsers/nomParsers/GeneralParsers';
import { InputFieldArgumentConfig, InputFieldArgumentConfigs } from '../../../parsers/GeneralConfigs';

export class StepSizeValueInputFieldArgument extends AbstractInputFieldArgument {
	value: number = 0;

	_parseValue(value: ParsingResultNode[]): void {
		this.value = Number.parseFloat(value[0].value);
		if (Number.isNaN(this.value)) {
			throw new MetaBindParsingError(
				ErrorLevel.WARNING,
				'failed to set value for input field argument',
				"value of argument 'stepSize' must be of type number",
			);
		}
		if (this.value <= 0) {
			throw new MetaBindParsingError(
				ErrorLevel.WARNING,
				'failed to set value for input field argument',
				"value of argument 'stepSize' must be a positive number",
			);
		}
	}

	public getConfig(): InputFieldArgumentConfig {
		return InputFieldArgumentConfigs.stepSize;
	}
}

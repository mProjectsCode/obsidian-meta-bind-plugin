import { AbstractInputFieldArgument } from '../AbstractInputFieldArgument';
import { type ParsingResultNode } from '../../../parsers/nomParsers/GeneralParsers';
import { ErrorLevel, MetaBindParsingError } from '../../../utils/errors/MetaBindErrors';
import { InputFieldArgumentConfig, InputFieldArgumentConfigs } from '../../../parsers/GeneralConfigs';

export class LimitInputFieldArgument extends AbstractInputFieldArgument {
	value: number | undefined = undefined;

	_parseValue(value: ParsingResultNode[]): void {
		this.value = Number.parseInt(value[0].value);
		if (Number.isNaN(this.value)) {
			throw new MetaBindParsingError(
				ErrorLevel.WARNING,
				'failed to set value for input field argument',
				"value of argument 'limit' must be of type number",
			);
		}

		if (this.value <= 0) {
			throw new MetaBindParsingError(ErrorLevel.WARNING, 'failed to set value for input field argument', "value of argument 'limit' must be positive");
		}
	}

	public getConfig(): InputFieldArgumentConfig {
		return InputFieldArgumentConfigs.limit;
	}
}

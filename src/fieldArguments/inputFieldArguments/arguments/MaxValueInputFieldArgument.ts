import { AbstractInputFieldArgument } from '../AbstractInputFieldArgument';
import { ErrorLevel, MetaBindArgumentError } from '../../../utils/errors/MetaBindErrors';
import { type ParsingResultNode } from '../../../parsers/nomParsers/GeneralParsers';
import { type InputFieldArgumentConfig, InputFieldArgumentConfigs } from '../../../parsers/GeneralConfigs';
import { DocsHelper } from '../../../utils/DocsHelper';

export class MaxValueInputFieldArgument extends AbstractInputFieldArgument {
	value: number = 100;

	_parseValue(value: ParsingResultNode[]): void {
		this.value = Number.parseFloat(value[0].value);
		if (Number.isNaN(this.value)) {
			throw new MetaBindArgumentError({
				errorLevel: ErrorLevel.WARNING,
				effect: 'failed to set value for input field argument',
				cause: "value of argument 'maxValue' must be of type number",
				docs: [DocsHelper.linkToInputFieldArgument(this.getConfig().type)],
			});
		}
	}

	public getConfig(): InputFieldArgumentConfig {
		return InputFieldArgumentConfigs.maxValue;
	}
}

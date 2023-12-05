import { AbstractInputFieldArgument } from '../AbstractInputFieldArgument';
import { ErrorLevel, MetaBindArgumentError } from '../../../../utils/errors/MetaBindErrors';
import { type ParsingResultNode } from '../../../../parsers/nomParsers/GeneralNomParsers';
import { type InputFieldArgumentConfig, InputFieldArgumentConfigs } from '../../../../config/FieldConfigs';
import { DocsUtils } from '../../../../utils/DocsUtils';

export class MinValueInputFieldArgument extends AbstractInputFieldArgument {
	value: number = 0;

	_parseValue(value: ParsingResultNode[]): void {
		this.value = Number.parseFloat(value[0].value);
		if (Number.isNaN(this.value)) {
			throw new MetaBindArgumentError({
				errorLevel: ErrorLevel.WARNING,
				effect: 'failed to set value for input field argument',
				cause: "value of argument 'minValue' must be of type number",
				docs: [DocsUtils.linkToInputFieldArgument(this.getConfig().type)],
			});
		}
	}

	public getConfig(): InputFieldArgumentConfig {
		return InputFieldArgumentConfigs.minValue;
	}
}

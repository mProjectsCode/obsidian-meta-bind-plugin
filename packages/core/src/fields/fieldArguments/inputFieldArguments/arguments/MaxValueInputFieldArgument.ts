import type { InputFieldArgumentConfig } from 'packages/core/src/config/FieldConfigs';
import { InputFieldArgumentConfigs } from 'packages/core/src/config/FieldConfigs';
import { AbstractInputFieldArgument } from 'packages/core/src/fields/fieldArguments/inputFieldArguments/AbstractInputFieldArgument';
import type { ParsingResultNode } from 'packages/core/src/parsers/nomParsers/GeneralNomParsers';
import { DocsUtils } from 'packages/core/src/utils/DocsUtils';
import { ErrorLevel, MetaBindArgumentError } from 'packages/core/src/utils/errors/MetaBindErrors';

export class MaxValueInputFieldArgument extends AbstractInputFieldArgument {
	value: number = 100;

	_parseValue(value: ParsingResultNode[]): void {
		this.value = Number.parseFloat(value[0].value);
		if (Number.isNaN(this.value)) {
			throw new MetaBindArgumentError({
				errorLevel: ErrorLevel.WARNING,
				effect: 'failed to set value for input field argument',
				cause: "value of argument 'maxValue' must be of type number",
				docs: [DocsUtils.linkToInputFieldArgument(this.getConfig().type)],
			});
		}
	}

	public getConfig(): InputFieldArgumentConfig {
		return InputFieldArgumentConfigs.maxValue;
	}
}

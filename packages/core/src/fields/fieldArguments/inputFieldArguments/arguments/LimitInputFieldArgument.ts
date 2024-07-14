import type { InputFieldArgumentConfig } from 'packages/core/src/config/FieldConfigs';
import { InputFieldArgumentConfigs } from 'packages/core/src/config/FieldConfigs';
import { AbstractInputFieldArgument } from 'packages/core/src/fields/fieldArguments/inputFieldArguments/AbstractInputFieldArgument';
import type { ParsingResultNode } from 'packages/core/src/parsers/nomParsers/GeneralNomParsers';
import { DocsUtils } from 'packages/core/src/utils/DocsUtils';
import { ErrorLevel, MetaBindArgumentError } from 'packages/core/src/utils/errors/MetaBindErrors';

export class LimitInputFieldArgument extends AbstractInputFieldArgument {
	value: number | undefined = undefined;

	_parseValue(value: ParsingResultNode[]): void {
		this.value = Number.parseInt(value[0].value);
		if (Number.isNaN(this.value)) {
			throw new MetaBindArgumentError({
				errorLevel: ErrorLevel.WARNING,
				effect: 'failed to set value for input field argument',
				cause: "value of argument 'limit' must be of type number",
				docs: [DocsUtils.linkToInputFieldArgument(this.getConfig().type)],
			});
		}
		if (this.value <= 0) {
			throw new MetaBindArgumentError({
				errorLevel: ErrorLevel.WARNING,
				effect: 'failed to set value for input field argument',
				cause: "value of argument 'limit' must be a positive number",
				docs: [DocsUtils.linkToInputFieldArgument(this.getConfig().type)],
			});
		}
	}

	public getConfig(): InputFieldArgumentConfig {
		return InputFieldArgumentConfigs.limit;
	}
}

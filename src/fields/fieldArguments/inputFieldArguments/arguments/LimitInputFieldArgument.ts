import { AbstractInputFieldArgument } from '../AbstractInputFieldArgument';
import { type ParsingResultNode } from '../../../../parsers/nomParsers/GeneralNomParsers';
import { ErrorLevel, MetaBindArgumentError } from '../../../../utils/errors/MetaBindErrors';
import { type InputFieldArgumentConfig, InputFieldArgumentConfigs } from '../../../../config/FieldConfigs';
import { DocsHelper } from '../../../../utils/DocsHelper';

export class LimitInputFieldArgument extends AbstractInputFieldArgument {
	value: number | undefined = undefined;

	_parseValue(value: ParsingResultNode[]): void {
		this.value = Number.parseInt(value[0].value);
		if (Number.isNaN(this.value)) {
			throw new MetaBindArgumentError({
				errorLevel: ErrorLevel.WARNING,
				effect: 'failed to set value for input field argument',
				cause: "value of argument 'limit' must be of type number",
				docs: [DocsHelper.linkToInputFieldArgument(this.getConfig().type)],
			});
		}
		if (this.value <= 0) {
			throw new MetaBindArgumentError({
				errorLevel: ErrorLevel.WARNING,
				effect: 'failed to set value for input field argument',
				cause: "value of argument 'limit' must be a positive number",
				docs: [DocsHelper.linkToInputFieldArgument(this.getConfig().type)],
			});
		}
	}

	public getConfig(): InputFieldArgumentConfig {
		return InputFieldArgumentConfigs.limit;
	}
}

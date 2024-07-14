import { type InputFieldArgumentConfig, InputFieldArgumentConfigs } from 'packages/core/src/config/FieldConfigs';
import { AbstractInputFieldArgument } from 'packages/core/src/fields/fieldArguments/inputFieldArguments/AbstractInputFieldArgument';
import type { ParsingResultNode } from 'packages/core/src/parsers/nomParsers/GeneralNomParsers';
import { type MBExtendedLiteral, parseLiteral } from 'packages/core/src/utils/Literal';

export class DefaultValueInputFieldArgument extends AbstractInputFieldArgument {
	value: MBExtendedLiteral = '';

	_parseValue(value: ParsingResultNode[]): void {
		this.value = parseLiteral(value[0].value);
	}

	public getConfig(): InputFieldArgumentConfig {
		return InputFieldArgumentConfigs.defaultValue;
	}
}

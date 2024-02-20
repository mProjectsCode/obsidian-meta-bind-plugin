import { type InputFieldArgumentConfig, InputFieldArgumentConfigs } from 'packages/core/src/config/FieldConfigs';
import { AbstractInputFieldArgument } from 'packages/core/src/fields/fieldArguments/inputFieldArguments/AbstractInputFieldArgument';
import { type ParsingResultNode } from 'packages/core/src/parsers/nomParsers/GeneralNomParsers';
import { type MBLiteral, parseLiteral } from 'packages/core/src/utils/Literal';

export class OffValueInputFieldArgument extends AbstractInputFieldArgument {
	value: MBLiteral = false;

	_parseValue(value: ParsingResultNode[]): void {
		this.value = parseLiteral(value[0].value);
	}

	public getConfig(): InputFieldArgumentConfig {
		return InputFieldArgumentConfigs.offValue;
	}
}

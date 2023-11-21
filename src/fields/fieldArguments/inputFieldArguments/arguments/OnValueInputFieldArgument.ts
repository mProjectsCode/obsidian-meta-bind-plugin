import { AbstractInputFieldArgument } from '../AbstractInputFieldArgument';
import { type ParsingResultNode } from '../../../../parsers/nomParsers/GeneralNomParsers';
import { type InputFieldArgumentConfig, InputFieldArgumentConfigs } from '../../../../config/FieldConfigs';
import { type MBLiteral, parseLiteral } from '../../../../utils/Literal';

export class OnValueInputFieldArgument extends AbstractInputFieldArgument {
	value: MBLiteral = true;

	_parseValue(value: ParsingResultNode[]): void {
		this.value = parseLiteral(value[0].value);
	}

	public getConfig(): InputFieldArgumentConfig {
		return InputFieldArgumentConfigs.onValue;
	}
}

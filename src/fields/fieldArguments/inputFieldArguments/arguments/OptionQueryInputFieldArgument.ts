import { AbstractInputFieldArgument } from '../AbstractInputFieldArgument';
import { type ParsingResultNode } from '../../../../parsers/nomParsers/GeneralNomParsers';
import { type InputFieldArgumentConfig, InputFieldArgumentConfigs } from '../../../../config/FieldConfigs';

export class OptionQueryInputFieldArgument extends AbstractInputFieldArgument {
	value: string = '';

	_parseValue(value: ParsingResultNode[]): void {
		this.value = value[0].value;
	}

	public getConfig(): InputFieldArgumentConfig {
		return InputFieldArgumentConfigs.optionQuery;
	}
}

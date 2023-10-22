import { AbstractInputFieldArgument } from '../AbstractInputFieldArgument';
import { type InputFieldArgumentConfig, InputFieldArgumentConfigs } from '../../../parsers/inputFieldParser/InputFieldConfigs';
import { type ParsingResultNode } from '../../../parsers/nomParsers/GeneralParsers';

export class TitleInputFieldArgument extends AbstractInputFieldArgument {
	value: string = '';

	_parseValue(value: ParsingResultNode[]): void {
		this.value = value[0].value;
	}

	public getConfig(): InputFieldArgumentConfig {
		return InputFieldArgumentConfigs.title;
	}
}

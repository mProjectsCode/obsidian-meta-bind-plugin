import { AbstractInputFieldArgument } from '../AbstractInputFieldArgument';

import { ParsingResultNode } from '../../parsers/inputFieldParser/InputFieldParser';
import { InputFieldArgumentConfig, InputFieldArgumentConfigs, InputFieldArgumentType, InputFieldType } from '../../inputFields/InputFieldConfigs';

export class TitleInputFieldArgument extends AbstractInputFieldArgument {
	value: string = '';

	_parseValue(value: ParsingResultNode[]): void {
		this.value = value[0].value;
	}

	public getConfig(): InputFieldArgumentConfig {
		return InputFieldArgumentConfigs.title;
	}
}

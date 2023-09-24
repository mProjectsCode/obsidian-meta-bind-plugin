import { AbstractInputFieldArgument } from '../AbstractInputFieldArgument';
import { ParsingResultNode } from '../../parsers/newInputFieldParser/InputFieldParser';
import { InputFieldArgumentConfig, InputFieldArgumentConfigs, InputFieldArgumentType, InputFieldType } from '../../inputFields/InputFieldConfigs';

export class PlaceholderInputFieldArgument extends AbstractInputFieldArgument {
	value: string = '';

	_parseValue(value: ParsingResultNode[]): void {
		this.value = value[0].value;
	}

	public getConfig(): InputFieldArgumentConfig {
		return InputFieldArgumentConfigs.placeholder;
	}
}

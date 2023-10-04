import { AbstractInputFieldArgument } from '../AbstractInputFieldArgument';
import { ParsingResultNode } from '../../parsers/inputFieldParser/InputFieldParser';
import { InputFieldArgumentConfig, InputFieldArgumentConfigs } from '../../inputFields/InputFieldConfigs';

export class ClassInputFieldArgument extends AbstractInputFieldArgument {
	value: string[] = [];

	_parseValue(value: ParsingResultNode[]): void {
		this.value = value[0].value.split(' ');
	}

	public getConfig(): InputFieldArgumentConfig {
		return InputFieldArgumentConfigs.class;
	}
}

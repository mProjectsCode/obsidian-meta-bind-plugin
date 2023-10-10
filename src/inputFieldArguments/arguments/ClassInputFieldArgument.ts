import { AbstractInputFieldArgument } from '../AbstractInputFieldArgument';
import { InputFieldArgumentConfig, InputFieldArgumentConfigs } from '../../inputFields/InputFieldConfigs';
import { ParsingResultNode } from '../../parsers/nomParsers/GeneralParsers';

export class ClassInputFieldArgument extends AbstractInputFieldArgument {
	value: string[] = [];

	_parseValue(value: ParsingResultNode[]): void {
		this.value = value[0].value.split(' ');
	}

	public getConfig(): InputFieldArgumentConfig {
		return InputFieldArgumentConfigs.class;
	}
}

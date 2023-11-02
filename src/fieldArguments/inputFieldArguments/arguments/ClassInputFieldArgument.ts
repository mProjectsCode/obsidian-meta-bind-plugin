import { AbstractInputFieldArgument } from '../AbstractInputFieldArgument';
import { type ParsingResultNode } from '../../../parsers/nomParsers/GeneralParsers';
import { type InputFieldArgumentConfig, InputFieldArgumentConfigs } from '../../../parsers/GeneralConfigs';

export class ClassInputFieldArgument extends AbstractInputFieldArgument {
	value: string[] = [];

	_parseValue(value: ParsingResultNode[]): void {
		this.value = value[0].value.split(' ');
	}

	public getConfig(): InputFieldArgumentConfig {
		return InputFieldArgumentConfigs.class;
	}
}

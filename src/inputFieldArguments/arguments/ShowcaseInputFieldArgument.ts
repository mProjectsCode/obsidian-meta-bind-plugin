import { AbstractInputFieldArgument } from '../AbstractInputFieldArgument';
import { InputFieldArgumentConfig, InputFieldArgumentConfigs } from '../../inputFields/InputFieldConfigs';
import { ParsingResultNode } from '../../parsers/nomParsers/GeneralParsers';

export class ShowcaseInputFieldArgument extends AbstractInputFieldArgument {
	value: boolean = true;

	_parseValue(value: ParsingResultNode[]): void {
		this.value = value[0] === undefined || value[0]?.value.toLowerCase() === 'true';
	}

	public getConfig(): InputFieldArgumentConfig {
		return InputFieldArgumentConfigs.showcase;
	}
}

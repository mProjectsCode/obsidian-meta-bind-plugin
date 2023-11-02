import { AbstractInputFieldArgument } from '../AbstractInputFieldArgument';
import { type ParsingResultNode } from '../../../parsers/nomParsers/GeneralParsers';
import { type InputFieldArgumentConfig, InputFieldArgumentConfigs } from '../../../parsers/GeneralConfigs';

export class UseLinksInputFieldArgument extends AbstractInputFieldArgument {
	value: boolean = true;

	_parseValue(value: ParsingResultNode[]): void {
		this.value = value[0] === undefined || value[0]?.value.toLowerCase() === 'true';
	}

	public getConfig(): InputFieldArgumentConfig {
		return InputFieldArgumentConfigs.useLinks;
	}
}

import { AbstractInputFieldArgument } from '../AbstractInputFieldArgument';
import { InputFieldArgumentConfig, InputFieldArgumentConfigs } from '../../../parsers/inputFieldParser/InputFieldConfigs';
import { ParsingResultNode } from '../../../parsers/nomParsers/GeneralParsers';

export class AddLabelsInputFieldArgument extends AbstractInputFieldArgument {
	value: boolean = true;

	override _parseValue(value: ParsingResultNode[]): void {
		this.value = value[0] === undefined || value[0]?.value.toLowerCase() === 'true';
	}

	public getConfig(): InputFieldArgumentConfig {
		return InputFieldArgumentConfigs.addLabels;
	}
}

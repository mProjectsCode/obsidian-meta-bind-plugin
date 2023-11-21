import { type ParsingResultNode } from '../../../../parsers/nomParsers/GeneralNomParsers';
import { AbstractViewFieldArgument } from '../AbstractViewFieldArgument';
import { type ViewFieldArgumentConfig, ViewFieldArgumentConfigs } from '../../../../config/FieldConfigs';

export class HiddenViewFieldArgument extends AbstractViewFieldArgument {
	value: boolean = true;

	_parseValue(value: ParsingResultNode[]): void {
		this.value = value[0] === undefined || value[0]?.value.toLowerCase() === 'true';
	}

	public getConfig(): ViewFieldArgumentConfig {
		return ViewFieldArgumentConfigs.hidden;
	}
}

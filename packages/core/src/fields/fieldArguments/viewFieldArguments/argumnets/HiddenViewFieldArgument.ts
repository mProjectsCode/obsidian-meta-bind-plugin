import type { ViewFieldArgumentConfig } from 'packages/core/src/config/FieldConfigs';
import { ViewFieldArgumentConfigs } from 'packages/core/src/config/FieldConfigs';
import { AbstractViewFieldArgument } from 'packages/core/src/fields/fieldArguments/viewFieldArguments/AbstractViewFieldArgument';
import type { ParsingResultNode } from 'packages/core/src/parsers/nomParsers/GeneralNomParsers';

export class HiddenViewFieldArgument extends AbstractViewFieldArgument {
	value: boolean = true;

	_parseValue(value: ParsingResultNode[]): void {
		this.value = value[0] === undefined || value[0]?.value.toLowerCase() === 'true';
	}

	public getConfig(): ViewFieldArgumentConfig {
		return ViewFieldArgumentConfigs.hidden;
	}
}

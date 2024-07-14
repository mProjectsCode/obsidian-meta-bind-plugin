import type { ViewFieldArgumentConfig } from 'packages/core/src/config/FieldConfigs';
import { ViewFieldArgumentConfigs } from 'packages/core/src/config/FieldConfigs';
import { AbstractViewFieldArgument } from 'packages/core/src/fields/fieldArguments/viewFieldArguments/AbstractViewFieldArgument';
import type { ParsingResultNode } from 'packages/core/src/parsers/nomParsers/GeneralNomParsers';

export class ClassViewFieldArgument extends AbstractViewFieldArgument {
	value: string[] = [];

	_parseValue(value: ParsingResultNode[]): void {
		this.value = value[0].value.split(' ');
	}

	public getConfig(): ViewFieldArgumentConfig {
		return ViewFieldArgumentConfigs.class;
	}
}

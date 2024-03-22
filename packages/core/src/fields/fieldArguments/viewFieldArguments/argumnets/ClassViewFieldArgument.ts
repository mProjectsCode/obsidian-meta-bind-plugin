import type { ParsingResultNode } from 'packages/core/src/parsers/nomParsers/GeneralNomParsers';
import { type ViewFieldArgumentConfig, ViewFieldArgumentConfigs } from 'packages/core/src/config/FieldConfigs';
import { AbstractViewFieldArgument } from 'packages/core/src/fields/fieldArguments/viewFieldArguments/AbstractViewFieldArgument';

export class ClassViewFieldArgument extends AbstractViewFieldArgument {
	value: string[] = [];

	_parseValue(value: ParsingResultNode[]): void {
		this.value = value[0].value.split(' ');
	}

	public getConfig(): ViewFieldArgumentConfig {
		return ViewFieldArgumentConfigs.class;
	}
}

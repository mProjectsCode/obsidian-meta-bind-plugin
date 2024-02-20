import { type ParsingResultNode } from 'packages/core/src/parsers/nomParsers/GeneralNomParsers';
import { AbstractViewFieldArgument } from 'packages/core/src/fields/fieldArguments/viewFieldArguments/AbstractViewFieldArgument';
import { type ViewFieldArgumentConfig, ViewFieldArgumentConfigs } from 'packages/core/src/config/FieldConfigs';

export class RenderMarkdownViewFieldArgument extends AbstractViewFieldArgument {
	value: boolean = true;

	_parseValue(value: ParsingResultNode[]): void {
		this.value = value[0] === undefined || value[0]?.value.toLowerCase() === 'true';
	}

	public getConfig(): ViewFieldArgumentConfig {
		return ViewFieldArgumentConfigs.renderMarkdown;
	}
}

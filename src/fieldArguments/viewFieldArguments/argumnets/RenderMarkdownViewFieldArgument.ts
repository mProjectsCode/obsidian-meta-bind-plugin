import { type ParsingResultNode } from '../../../parsers/nomParsers/GeneralParsers';
import { AbstractViewFieldArgument } from '../AbstractViewFieldArgument';
import { ViewFieldArgumentConfig, ViewFieldArgumentConfigs } from '../../../parsers/GeneralConfigs';

export class RenderMarkdownViewFieldArgument extends AbstractViewFieldArgument {
	value: boolean = true;

	_parseValue(value: ParsingResultNode[]): void {
		this.value = value[0] === undefined || value[0]?.value.toLowerCase() === 'true';
	}

	public getConfig(): ViewFieldArgumentConfig {
		return ViewFieldArgumentConfigs.renderMarkdown;
	}
}

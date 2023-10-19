import { AbstractViewFieldArgument } from './AbstractViewFieldArgument';
import { ViewFieldArgumentType } from '../../parsers/viewFieldParser/ViewFieldConfigs';
import { RenderMarkdownViewFieldArgument } from './argumnets/RenderMarkdownViewFieldArgument';
import { HiddenViewFieldArgument } from './argumnets/HiddenViewFieldArgument';
import { ErrorLevel, MetaBindParsingError } from '../../utils/errors/MetaBindErrors';

export class ViewFieldArgumentFactory {
	static createViewFieldArgument(argumentIdentifier: string): AbstractViewFieldArgument {
		if (argumentIdentifier === ViewFieldArgumentType.RENDER_MARKDOWN) {
			return new RenderMarkdownViewFieldArgument();
		} else if (argumentIdentifier === ViewFieldArgumentType.HIDDEN) {
			return new HiddenViewFieldArgument();
		} else {
			throw new MetaBindParsingError(ErrorLevel.ERROR, 'can not crate view field argument', `unknown argument '${argumentIdentifier}'`);
		}
	}
}

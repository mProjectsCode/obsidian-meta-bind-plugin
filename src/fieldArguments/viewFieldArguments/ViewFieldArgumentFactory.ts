import { RenderMarkdownViewFieldArgument } from './argumnets/RenderMarkdownViewFieldArgument';
import { HiddenViewFieldArgument } from './argumnets/HiddenViewFieldArgument';
import { ErrorLevel, MetaBindParsingError } from '../../utils/errors/MetaBindErrors';
import { ViewFieldArgumentType } from '../../parsers/GeneralConfigs';

/**
 * Maps the view field argument types to the view field constructors.
 * Add new view field arguments here.
 */
export const VIEW_FIELD_ARGUMENT_MAP = {
	[ViewFieldArgumentType.RENDER_MARKDOWN]: RenderMarkdownViewFieldArgument,
	[ViewFieldArgumentType.HIDDEN]: HiddenViewFieldArgument,
} as const;

export type ViewFieldArgumentMapType<T extends ViewFieldArgumentType> = T extends keyof typeof VIEW_FIELD_ARGUMENT_MAP
	? InstanceType<(typeof VIEW_FIELD_ARGUMENT_MAP)[T]>
	: undefined;

export type ViewFieldArgumentConstructorMapType<T extends ViewFieldArgumentType> = T extends keyof typeof VIEW_FIELD_ARGUMENT_MAP
	? (typeof VIEW_FIELD_ARGUMENT_MAP)[T]
	: undefined;

export class ViewFieldArgumentFactory {
	static createViewFieldArgument(argumentIdentifier: ViewFieldArgumentType): NonNullable<ViewFieldArgumentMapType<typeof argumentIdentifier>> {
		if (argumentIdentifier in VIEW_FIELD_ARGUMENT_MAP) {
			// @ts-ignore Thanks to the `if` we know that the object has the property
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			const viewFieldConstructor: ViewFieldArgumentConstructorMapType<typeof argumentIdentifier> = VIEW_FIELD_ARGUMENT_MAP[argumentIdentifier];

			if (viewFieldConstructor) {
				return new viewFieldConstructor();
			}
		}

		throw new MetaBindParsingError(ErrorLevel.ERROR, 'can not crate view field argument', `unknown argument '${argumentIdentifier}'`);
	}
}

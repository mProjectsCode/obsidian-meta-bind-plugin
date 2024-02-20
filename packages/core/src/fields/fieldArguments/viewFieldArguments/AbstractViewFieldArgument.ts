import { AbstractFieldArgument } from 'packages/core/src/fields/fieldArguments/AbstractFieldArgument';
import {
	type ViewFieldArgumentConfig,
	type ViewFieldArgumentType,
	type ViewFieldType,
} from 'packages/core/src/config/FieldConfigs';

export abstract class AbstractViewFieldArgument extends AbstractFieldArgument<
	ViewFieldType,
	ViewFieldArgumentType,
	ViewFieldArgumentConfig
> {}

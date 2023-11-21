import { AbstractFieldArgument } from '../AbstractFieldArgument';
import {
	type ViewFieldArgumentConfig,
	type ViewFieldArgumentType,
	type ViewFieldType,
} from '../../../config/FieldConfigs';

export abstract class AbstractViewFieldArgument extends AbstractFieldArgument<
	ViewFieldType,
	ViewFieldArgumentType,
	ViewFieldArgumentConfig
> {}

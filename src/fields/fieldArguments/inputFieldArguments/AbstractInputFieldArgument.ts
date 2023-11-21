import { AbstractFieldArgument } from '../AbstractFieldArgument';
import {
	type InputFieldArgumentConfig,
	type InputFieldArgumentType,
	type InputFieldType,
} from '../../../config/FieldConfigs';

export abstract class AbstractInputFieldArgument extends AbstractFieldArgument<
	InputFieldType,
	InputFieldArgumentType,
	InputFieldArgumentConfig
> {}

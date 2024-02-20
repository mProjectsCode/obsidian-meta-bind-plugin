import {
	type InputFieldArgumentConfig,
	type InputFieldArgumentType,
	type InputFieldType,
} from 'packages/core/src/config/FieldConfigs';
import { AbstractFieldArgument } from 'packages/core/src/fields/fieldArguments/AbstractFieldArgument';

export abstract class AbstractInputFieldArgument extends AbstractFieldArgument<
	InputFieldType,
	InputFieldArgumentType,
	InputFieldArgumentConfig
> {}

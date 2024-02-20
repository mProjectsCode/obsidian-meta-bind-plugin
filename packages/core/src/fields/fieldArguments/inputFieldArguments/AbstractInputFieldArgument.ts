import { AbstractFieldArgument } from 'packages/core/src/fields/fieldArguments/AbstractFieldArgument';
import {
	type InputFieldArgumentConfig,
	type InputFieldArgumentType,
	type InputFieldType,
} from 'packages/core/src/config/FieldConfigs';

export abstract class AbstractInputFieldArgument extends AbstractFieldArgument<
	InputFieldType,
	InputFieldArgumentType,
	InputFieldArgumentConfig
> {}

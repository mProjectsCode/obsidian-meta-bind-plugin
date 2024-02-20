import { AbstractFieldArgumentContainer } from 'packages/core/src/fields/fieldArguments/AbstractFieldArgumentContainer';
import { type InputFieldArgumentMapType } from 'packages/core/src/fields/fieldArguments/inputFieldArguments/InputFieldArgumentFactory';
import {
	type InputFieldArgumentConfig,
	type InputFieldArgumentType,
	type InputFieldType,
} from 'packages/core/src/config/FieldConfigs';

export class InputFieldArgumentContainer extends AbstractFieldArgumentContainer<
	InputFieldType,
	InputFieldArgumentType,
	InputFieldArgumentConfig
> {
	getAll<T extends InputFieldArgumentType>(name: T): NonNullable<InputFieldArgumentMapType<T>>[] {
		// @ts-ignore
		return super.getAll(name);
	}

	get<T extends InputFieldArgumentType>(name: T): InputFieldArgumentMapType<T> | undefined {
		return this.getAll(name).at(0);
	}
}

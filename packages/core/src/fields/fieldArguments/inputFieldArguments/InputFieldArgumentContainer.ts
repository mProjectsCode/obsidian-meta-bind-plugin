import type {
	InputFieldArgumentConfig,
	InputFieldArgumentType,
	InputFieldType,
} from 'packages/core/src/config/FieldConfigs';
import { AbstractFieldArgumentContainer } from 'packages/core/src/fields/fieldArguments/AbstractFieldArgumentContainer';
import type { InputFieldArgumentMapType } from 'packages/core/src/fields/fieldArguments/inputFieldArguments/InputFieldArgumentFactory';

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

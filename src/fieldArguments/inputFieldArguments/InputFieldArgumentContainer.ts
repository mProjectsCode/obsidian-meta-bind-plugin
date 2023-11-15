import { AbstractFieldArgumentContainer } from '../AbstractFieldArgumentContainer';
import { type InputFieldArgumentMapType } from './InputFieldArgumentFactory';
import {
	type InputFieldArgumentConfig,
	type InputFieldArgumentType,
	type InputFieldType,
} from '../../parsers/GeneralConfigs';

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

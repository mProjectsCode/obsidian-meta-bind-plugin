import { AbstractFieldArgumentContainer } from 'packages/core/src/fields/fieldArguments/AbstractFieldArgumentContainer';
import { type ViewFieldArgumentMapType } from 'packages/core/src/fields/fieldArguments/viewFieldArguments/ViewFieldArgumentFactory';
import {
	type ViewFieldArgumentConfig,
	type ViewFieldArgumentType,
	type ViewFieldType,
} from 'packages/core/src/config/FieldConfigs';

export class ViewFieldArgumentContainer extends AbstractFieldArgumentContainer<
	ViewFieldType,
	ViewFieldArgumentType,
	ViewFieldArgumentConfig
> {
	getAll<T extends ViewFieldArgumentType>(name: T): NonNullable<ViewFieldArgumentMapType<T>>[] {
		// @ts-ignore
		return super.getAll(name);
	}

	get<T extends ViewFieldArgumentType>(name: T): ViewFieldArgumentMapType<T> | undefined {
		return this.getAll(name).at(0);
	}
}

import type { Moment } from 'moment';
import { InputFieldArgumentType } from 'packages/core/src/config/FieldConfigs';
import type { OptionInputFieldArgument } from 'packages/core/src/fields/fieldArguments/inputFieldArguments/arguments/OptionInputFieldArgument';
import { AbstractInputField } from 'packages/core/src/fields/inputFields/AbstractInputField';
import DatePickerComponent from 'packages/core/src/fields/inputFields/fields/DatePicker/DatePickerComponent.svelte';
import type { InputFieldMountable } from 'packages/core/src/fields/inputFields/InputFieldMountable';
import type { InputFieldSvelteComponent } from 'packages/core/src/fields/inputFields/InputFieldSvelteWrapper';
import { DateParser } from 'packages/core/src/parsers/DateParser';

export class DatePickerIPF extends AbstractInputField<string | null, Moment | null> {
	options: OptionInputFieldArgument[];

	constructor(mountable: InputFieldMountable) {
		super(mountable);

		this.options = this.mountable.getArguments(InputFieldArgumentType.OPTION);
	}

	protected filterValue(value: unknown): string | null | undefined {
		if (value === null) {
			return null;
		}
		if (value === undefined || typeof value !== 'string') {
			return undefined;
		}
		const date = DateParser.parse(value);
		if (date.isValid()) {
			return DateParser.stringify(date);
		} else {
			return undefined;
		}
	}

	protected getFallbackDefaultValue(): Moment {
		return DateParser.getDefaultDate();
	}

	protected getSvelteComponent(): InputFieldSvelteComponent<Moment | null> {
		// @ts-ignore
		return DatePickerComponent;
	}

	protected rawMapValue(value: Moment | null): string | null {
		if (value === null) {
			return null;
		}
		console.log('value', value, DateParser.stringify(value), DateParser.dateFormat);

		return DateParser.stringify(value);
	}

	protected rawReverseMapValue(value: string | null): Moment | null | undefined {
		if (value === null) {
			return null;
		}
		const date = DateParser.parse(value);
		if (date.isValid()) {
			return date;
		} else {
			return undefined;
		}
	}

	protected getMountArgs(): Record<string, unknown> {
		return {
			dateFormat: this.mountable.plugin.settings.preferredDateFormat,
			showDatePicker: (): void => {
				this.mountable.plugin.internal.openDatePickerModal(this);
			},
		};
	}
}

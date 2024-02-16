import { AbstractInputField } from '../../AbstractInputField';
import { type OptionInputFieldArgument } from '../../../fieldArguments/inputFieldArguments/arguments/OptionInputFieldArgument';
import { type SvelteComponent } from 'svelte';
import { type moment } from 'obsidian';
import DatePickerComponent from './DatePickerComponent.svelte';
import { DateParser } from '../../../../parsers/DateParser';
import { InputFieldArgumentType } from '../../../../config/FieldConfigs';

import { type InputFieldBase } from '../../InputFieldBase';

export class DatePickerIPF extends AbstractInputField<string | null, moment.Moment | null> {
	options: OptionInputFieldArgument[];

	constructor(base: InputFieldBase) {
		super(base);

		this.options = this.base.getArguments(InputFieldArgumentType.OPTION);
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

	protected getFallbackDefaultValue(): moment.Moment {
		return DateParser.getDefaultDate();
	}

	protected getSvelteComponent(): typeof SvelteComponent {
		// @ts-ignore
		return DatePickerComponent;
	}

	protected rawMapValue(value: moment.Moment | null): string | null {
		if (value === null) {
			return null;
		}
		return DateParser.stringify(value);
	}

	protected rawReverseMapValue(value: string | null): moment.Moment | null | undefined {
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
			dateFormat: this.base.plugin.settings.preferredDateFormat,
			showDatePicker: (): void => {
				this.base.plugin.internal.openDatePickerModal(this);
			},
		};
	}
}

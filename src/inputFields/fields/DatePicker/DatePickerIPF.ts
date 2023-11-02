import { AbstractInputField } from '../../AbstractInputField';
import { type OptionInputFieldArgument } from '../../../fieldArguments/inputFieldArguments/arguments/OptionInputFieldArgument';
import { type InputFieldMDRC } from '../../../renderChildren/InputFieldMDRC';
import { type SvelteComponent } from 'svelte';
import { type moment } from 'obsidian';
import DatePickerComponent from './DatePickerComponent.svelte';
import { DateParser } from '../../../parsers/DateParser';
import { DatePickerInputModal } from './DatePickerInputModal';
import { InputFieldArgumentType } from '../../../parsers/GeneralConfigs';

export class DatePickerIPF extends AbstractInputField<string | null, moment.Moment | null> {
	options: OptionInputFieldArgument[];

	constructor(renderChild: InputFieldMDRC) {
		super(renderChild);

		this.options = this.renderChild.getArguments(InputFieldArgumentType.OPTION);
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
			dateFormat: this.renderChild.plugin.settings.preferredDateFormat,
			showDatePicker: (): void => {
				new DatePickerInputModal(this.renderChild.plugin.app, this).open();
			},
		};
	}
}

import { Moment } from 'moment';
import DatePicker from './DatePicker.svelte';
import { DatePickerInputField } from './DatePickerInputField';
import { App, Modal } from 'obsidian';

export class DatePickerModal extends Modal {
	inputField: DatePickerInputField;

	constructor(app: App, inputField: DatePickerInputField) {
		super(app);
		this.inputField = inputField;
	}

	public onOpen(): void {
		const { contentEl } = this;

		new DatePicker({
			target: contentEl,
			props: {
				selectedDate: this.inputField.date,
				dateChangeCallback: (value: Moment | null) => this.inputField.datePickerValueChanged(value),
			},
		});
	}
}

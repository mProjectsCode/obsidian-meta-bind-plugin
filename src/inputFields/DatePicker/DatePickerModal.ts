import { App, Modal } from 'obsidian';
import { Moment } from 'moment';
import DatePicker from './DatePicker.svelte';
import { DatePickerInputField } from './DatePickerInputField';

export class DatePickerModal extends Modal {
	opener: DatePickerInputField;

	constructor(app: App, opener: DatePickerInputField) {
		super(app);
		this.opener = opener;
	}

	public onOpen(): void {
		const { contentEl } = this;

		new DatePicker({
			target: contentEl,
			props: {
				selectedDate: this.opener.date,
				dateChangeCallback: (value: Moment) => this.opener.datePickerValueChanged(value),
			},
		});
	}
}

import { App, Modal } from 'obsidian';
import DatePickerInput from '../../../fields/DatePicker/DatePicker.svelte';
import { DatePicker } from './DatePicker';
import { Moment } from 'moment/moment';

export class DatePickerInputModal extends Modal {
	datePickerInput: DatePickerInput | undefined;
	datePicker: DatePicker;

	constructor(app: App, datePicker: DatePicker) {
		super(app);
		this.datePicker = datePicker;
	}

	public onOpen(): void {
		this.datePickerInput = new DatePickerInput({
			target: this.contentEl,
			props: {
				selectedDate: this.datePicker.getInternalValue(),
				dateChangeCallback: (value: Moment | null) => {
					this.datePicker.setInternalValue(value);
					this.close();
				},
			},
		});
	}

	public onClose(): void {
		this.datePickerInput?.$destroy();
	}
}

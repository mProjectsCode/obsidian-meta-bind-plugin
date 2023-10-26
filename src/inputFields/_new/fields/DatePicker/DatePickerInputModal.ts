import { type App, Modal } from 'obsidian';
import DatePickerInput from '../../../fields/DatePicker/DatePicker.svelte';
import { type DatePickerIPF } from './DatePickerIPF';
import { type Moment } from 'moment/moment';

export class DatePickerInputModal extends Modal {
	datePickerInput: DatePickerInput | undefined;
	datePicker: DatePickerIPF;

	constructor(app: App, datePicker: DatePickerIPF) {
		super(app);
		this.datePicker = datePicker;
	}

	public onOpen(): void {
		this.datePickerInput = new DatePickerInput({
			target: this.contentEl,
			props: {
				selectedDate: this.datePicker.getInternalValue(),
				dateChangeCallback: (value: Moment | null): void => {
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

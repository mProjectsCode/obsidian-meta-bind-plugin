import { InputFieldMarkdownRenderChild } from '../../InputFieldMarkdownRenderChild';
import { AbstractInputField } from '../AbstractInputField';
import DatePickerInput from './DatePickerInput.svelte';
import { moment } from 'obsidian';
import { DateParser } from '../../parsers/DateParser';
import { DatePickerModal } from './DatePickerModal';
import { Moment } from 'moment';
import { MetaBindInternalError } from '../../utils/MetaBindErrors';

export class DatePickerInputField extends AbstractInputField {
	container: HTMLDivElement | undefined;
	component: DatePickerInput | undefined;
	modal: DatePickerModal | undefined;
	date: moment.Moment;

	constructor(inputFieldMarkdownRenderChild: InputFieldMarkdownRenderChild) {
		super(inputFieldMarkdownRenderChild);

		this.date = DateParser.getDefaultDate();
	}

	getValue(): any {
		return DateParser.stringify(this.date);
	}

	setValue(value: any): void {
		this.date = DateParser.parse(value) ?? DateParser.getDefaultDate();

		if (!this.date.isValid()) {
			this.date = DateParser.getDefaultDate();
			this.onValueChange(this.getValue());
		}

		this.component?.$set({ selectedDate: this.date });
	}

	isEqualValue(value: any): boolean {
		return this.getValue() == value;
	}

	getDefaultValue(): any {
		return DateParser.stringify(DateParser.getDefaultDate());
	}

	getHtmlElement(): HTMLElement {
		if (!this.container) {
			throw new MetaBindInternalError('');
		}

		return this.container;
	}

	datePickerValueChanged(date: Moment): void {
		this.date = date;
		this.component?.updateValue(this.date);
		this.modal?.close();
		// console.log('date picker value change', this.date);

		if (this.date.isValid()) {
			this.onValueChange(this.getValue());
		}
	}

	showDatePicker(): void {
		this.modal = new DatePickerModal(this.renderChild.plugin.app, this);
		this.modal.open();
	}

	render(container: HTMLDivElement): void {
		console.debug(`meta-bind | DatePickerInputField >> render ${this.renderChild.uuid}`);

		this.container = container;

		this.date = DateParser.parse(this.renderChild.getInitialValue()) ?? DateParser.getDefaultDate();
		if (!this.date.isValid()) {
			this.date = DateParser.getDefaultDate();
			this.onValueChange(this.getValue());
		}

		this.component = new DatePickerInput({
			target: container,
			props: {
				dateFormat: this.renderChild.plugin.settings.preferredDateFormat,
				showDatePicker: () => this.showDatePicker(),
				selectedDate: this.date,
			},
		});
	}

	public destroy(): void {
		this.component?.$destroy();
	}
}

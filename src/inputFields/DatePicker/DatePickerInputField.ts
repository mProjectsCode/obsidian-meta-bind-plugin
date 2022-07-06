import {InputFieldMarkdownRenderChild} from '../../InputFieldMarkdownRenderChild';
import {AbstractInputField} from '../AbstractInputField';
import {MetaBindInternalError} from '../../utils/Utils';
import DatePicker from './DatePicker.svelte';
import {moment} from 'obsidian';
import {DateParser} from '../../parsers/DateParser';

export class DatePickerInputField extends AbstractInputField {
	container: HTMLDivElement | undefined;
	component: DatePicker | undefined;
	date: moment.Moment;

	constructor(inputFieldMarkdownRenderChild: InputFieldMarkdownRenderChild, onValueChange: (value: any) => (void | Promise<void>)) {
		super(inputFieldMarkdownRenderChild, onValueChange);

		this.date = DateParser.getDefaultDate();
	}

	getValue(): any {
		return DateParser.stringify(this.date);
	}

	setValue(value: any): void {
		this.date = DateParser.parse(value) ?? DateParser.getDefaultDate();
		this.component?.$set({'selectedDate': this.date});
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

	datePickerValueChanged(date: moment.Moment): void {
		this.date = date;
		console.log('date picker value change', this.date);

		this.onValueChange(this.getValue());
	}

	render(container: HTMLDivElement): void {
		this.container = container;

		this.date = DateParser.parse(this.inputFieldMarkdownRenderChild.getInitialValue()) ?? DateParser.getDefaultDate();

		this.component = new DatePicker({
			target: container,
			props: {
				selectedDate: this.date,
				dateChangeCallback: (date: moment.Moment) => this.datePickerValueChanged(date),
			},
		})
	}

}

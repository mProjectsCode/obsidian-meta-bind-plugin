import { InputFieldMarkdownRenderChild } from '../../InputFieldMarkdownRenderChild';
import { AbstractInputField } from '../AbstractInputField';
import { MetaBindInternalError } from '../../utils/Utils';
import DatePicker from './DatePicker.svelte';
import { moment } from 'obsidian';
import { DateParser } from '../../parsers/DateParser';
import { InputFieldArgumentType } from '../../parsers/InputFieldDeclarationParser';

export class DatePickerInputField extends AbstractInputField {
	container: HTMLDivElement | undefined;
	component: DatePicker | undefined;
	date: moment.Moment;

	constructor(inputFieldMarkdownRenderChild: InputFieldMarkdownRenderChild, onValueChange: (value: any) => void | Promise<void>) {
		super(inputFieldMarkdownRenderChild, onValueChange);

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

	datePickerValueChanged(date: moment.Moment): void {
		this.date = date;
		// console.log('date picker value change', this.date);

		if (this.date.isValid()) {
			this.onValueChange(this.getValue());
		}
	}

	render(container: HTMLDivElement): void {
		console.debug(`meta-bind | render datePickerInputField ${this.inputFieldMarkdownRenderChild.uid}`);

		this.container = container;

		this.date = DateParser.parse(this.inputFieldMarkdownRenderChild.getInitialValue()) ?? DateParser.getDefaultDate();
		if (!this.date.isValid()) {
			this.date = DateParser.getDefaultDate();
			this.onValueChange(this.getValue());
		}

		this.component = new DatePicker({
			target: container,
			props: {
				alignRight: this.inputFieldMarkdownRenderChild.getArgument(InputFieldArgumentType.ALIGN_RIGHT)?.value,
				selectedDate: this.date,
				dateFormat: this.inputFieldMarkdownRenderChild.plugin.settings.preferredDateFormat,
				dateChangeCallback: (date: moment.Moment) => this.datePickerValueChanged(date),
			},
		});
	}
}

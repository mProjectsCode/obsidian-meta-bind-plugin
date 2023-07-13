import { AbstractInputField } from '../../AbstractInputField';
import DatePickerInput from './DatePickerInput.svelte';
import { moment } from 'obsidian';
import { DateParser } from '../../../parsers/DateParser';
import { DatePickerModal } from './DatePickerModal';
import { Moment } from 'moment';
import { ErrorLevel, MetaBindInternalError } from '../../../utils/errors/MetaBindErrors';
import { InputFieldMDRC } from '../../../renderChildren/InputFieldMDRC';
import { MBExtendedLiteral } from '../../../utils/Utils';

type T = string | null;

export class DatePickerInputField extends AbstractInputField<T> {
	container: HTMLDivElement | undefined;
	component: DatePickerInput | undefined;
	modal: DatePickerModal | undefined;
	date: moment.Moment | null;

	constructor(inputFieldMDRC: InputFieldMDRC) {
		super(inputFieldMDRC);

		this.date = DateParser.getDefaultDate();
	}

	getValue(): T | undefined {
		if (!this.component) {
			return undefined;
		}
		return this.date !== null ? DateParser.stringify(this.date) : null;
	}

	filterValue(value: MBExtendedLiteral | undefined): T | undefined {
		if (value === undefined || typeof value !== 'string') {
			return null;
		}
		const date = DateParser.parse(value);
		if (date.isValid()) {
			return DateParser.stringify(date);
		} else {
			return null;
		}
	}

	updateDisplayValue(value: T): void {
		this.date = value !== null ? DateParser.parse(value) : null;
		this.component?.updateValue(this.date);
	}

	getFallbackDefaultValue(): string {
		return DateParser.stringify(DateParser.getDefaultDate());
	}

	getHtmlElement(): HTMLElement {
		if (!this.container) {
			throw new MetaBindInternalError(ErrorLevel.WARNING, 'failed to get html element for input field', "container is undefined, field hasn't been rendered yet");
		}

		return this.container;
	}

	datePickerValueChanged(date: Moment | null): void {
		this.date = date;
		this.component?.updateValue(this.date);
		this.modal?.close();
		// console.log('date picker value change', this.date);

		if (!this.date || this.date.isValid()) {
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

		const initialValue = this.getInitialValue();
		this.date = initialValue !== null ? DateParser.parse(initialValue) : null;

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

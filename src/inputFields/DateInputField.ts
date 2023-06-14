import { AbstractInputField } from './AbstractInputField';
import { DropdownComponent, moment, TextComponent } from 'obsidian';
import { DateParser } from '../parsers/DateParser';
import { ErrorLevel, MetaBindInternalError, MetaBindValueError } from '../utils/errors/MetaBindErrors';
import { InputFieldMDRC } from '../renderChildren/InputFieldMDRC';

export class DateInputField extends AbstractInputField {
	container: HTMLDivElement | undefined;
	date: moment.Moment;

	months: Record<string, string> = {
		'0': 'January',
		'1': 'February',
		'2': 'March',
		'3': 'April',
		'4': 'May',
		'5': 'June',
		'6': 'July',
		'7': 'August',
		'8': 'September',
		'9': 'October',
		'10': 'November',
		'11': 'December',
	};
	days: Record<string, string>;

	monthComponent: DropdownComponent | undefined;
	dayComponent: DropdownComponent | undefined;
	yearComponent: TextComponent | undefined;

	constructor(inputFieldMDRC: InputFieldMDRC) {
		super(inputFieldMDRC);

		this.date = DateParser.getDefaultDate();

		this.days = {};
		for (let i = 1; i <= 31; i++) {
			this.days[i.toString()] = i.toString();
		}
	}

	public getHtmlElement(): HTMLElement {
		if (!this.container) {
			throw new MetaBindInternalError(ErrorLevel.WARNING, 'failed to get html element for input field', "container is undefined, field hasn't been rendered yet");
		}

		return this.container;
	}

	public getValue(): string | undefined {
		if (!this.monthComponent) {
			return undefined;
		}
		if (!this.dayComponent) {
			return undefined;
		}
		if (!this.yearComponent) {
			return undefined;
		}

		return DateParser.stringify(this.date);
	}

	public setValue(value: string): void {
		if (!this.monthComponent) {
			return;
		}
		if (!this.dayComponent) {
			return;
		}
		if (!this.yearComponent) {
			return;
		}

		this.date = DateParser.parse(value);
		if (!this.date) {
			console.warn(new MetaBindValueError(ErrorLevel.WARNING, 'failed to set value', `invalid value '${value}' at dateInputField ${this.renderChild.uuid}`));
			this.date = DateParser.getDefaultDate();
		}

		if (!this.date.isValid()) {
			this.date = DateParser.getDefaultDate();
			// this.onValueChange(this.getValue());
		}

		// console.log(this.date);
		this.monthComponent.setValue(this.date.month().toString());
		this.dayComponent.setValue(this.date.date().toString());
		this.yearComponent.setValue(this.date.year().toString());
	}

	public isEqualValue(value: any): boolean {
		return value == this.getValue();
	}

	public getDefaultValue(): any {
		return DateParser.stringify(DateParser.getDefaultDate());
	}

	public render(container: HTMLDivElement): void {
		console.debug(`meta-bind | DateInputField >> render ${this.renderChild.uuid}`);

		this.date = DateParser.parse(this.renderChild.getInitialValue()) ?? DateParser.getDefaultDate();
		if (!this.date.isValid()) {
			this.date = DateParser.getDefaultDate();
			this.onValueChange(this.getValue());
		}

		let useUsInputOrder = this.renderChild.plugin.settings.useUsDateInputOrder;

		container.removeClass('meta-bind-plugin-input-wrapper');
		container.addClass('meta-bind-plugin-flex-input-wrapper', 'meta-bind-plugin-input-element-group');

		if (!useUsInputOrder) {
			this.dayComponent = new DropdownComponent(container);
			this.dayComponent.addOptions(this.days);
			this.dayComponent.setValue(this.date.date().toString());
			this.dayComponent.onChange(this.onDayChange.bind(this));

			this.monthComponent = new DropdownComponent(container);
			this.monthComponent.addOptions(this.months);
			this.monthComponent.setValue(this.date.month().toString());
			this.monthComponent.onChange(this.onMonthChange.bind(this));

			this.dayComponent.selectEl.addClass('meta-bind-plugin-input-element-group-element');
			this.monthComponent.selectEl.addClass('meta-bind-plugin-input-element-group-element');
		} else {
			this.monthComponent = new DropdownComponent(container);
			this.monthComponent.addOptions(this.months);
			this.monthComponent.setValue(this.date.month().toString());
			this.monthComponent.onChange(this.onMonthChange.bind(this));

			this.dayComponent = new DropdownComponent(container);
			this.dayComponent.addOptions(this.days);
			this.dayComponent.setValue(this.date.date().toString());
			this.dayComponent.onChange(this.onDayChange.bind(this));

			this.dayComponent.selectEl.addClass('meta-bind-plugin-input-element-group-element');
			this.monthComponent.selectEl.addClass('meta-bind-plugin-input-element-group-element');
		}

		this.yearComponent = new TextComponent(container);
		this.yearComponent.setValue(this.date.year().toString());
		this.yearComponent.onChange(this.onYearChange.bind(this));

		this.yearComponent.inputEl.addClass('meta-bind-plugin-date-input-year-input');
		this.yearComponent.inputEl.addClass('meta-bind-plugin-input-element-group-element');
		this.yearComponent.inputEl.type = 'number';
		this.yearComponent.inputEl.max = '9999';

		this.container = container;
	}

	public destroy(): void {}

	private onMonthChange(value: string): void {
		this.date.month(value);

		const clampedDay = this.clampDay(this.date.date());
		this.dayComponent?.setValue(clampedDay.toString());
		this.date.date(clampedDay);

		this.onValueChange(this.getValue());
	}

	private onDayChange(value: string): void {
		const day = Number.parseInt(value);
		const clampedDay = this.clampDay(day);
		if (clampedDay !== day) {
			this.dayComponent?.setValue(clampedDay.toString());
		}

		this.date.date(clampedDay);
		this.onValueChange(this.getValue());
	}

	private onYearChange(value: string): void {
		const year = Number.parseInt(value);
		this.date.year(Number.isNaN(year) ? DateParser.getDefaultYear() : year);
		this.onValueChange(this.getValue());
	}

	private clampDay(day: number): number {
		if (Number.isNaN(day)) {
			return DateParser.getDefaultDay();
		} else if (day < 1) {
			return 1;
		} else if (day > this.date.daysInMonth()) {
			return this.date.daysInMonth();
		}
		return day;
	}
}

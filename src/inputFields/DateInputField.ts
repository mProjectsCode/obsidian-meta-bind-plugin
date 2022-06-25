import {AbstractInputField} from './AbstractInputField';
import {DropdownComponent, TextComponent} from 'obsidian';
import {InputFieldMarkdownRenderChild} from '../InputFieldMarkdownRenderChild';
import {Date, DateFormat, DateParser} from '../parsers/DateParser';

export class DateInputField extends AbstractInputField {
	container: HTMLDivElement;
	date: Date;

	months: Record<string, string> = {
		'1': 'January',
		'2': 'February',
		'3': 'March',
		'4': 'April',
		'5': 'May',
		'6': 'June',
		'7': 'July',
		'8': 'August',
		'9': 'September',
		'10': 'October',
		'11': 'November',
		'12': 'December',
	};
	days: Record<string, string>;

	monthComponent: DropdownComponent;
	dayComponent: DropdownComponent;
	yearComponent: TextComponent;


	constructor(inputFieldMarkdownRenderChild: InputFieldMarkdownRenderChild, onValueChange: (value: any) => (void | Promise<void>)) {
		super(inputFieldMarkdownRenderChild, onValueChange);

		this.days = {};
		for (let i = 1; i <= 31; i++) {
			this.days[i.toString()] = i.toString();
		}
	}

	public getHtmlElement(): HTMLElement {
		return this.container;
	}

	public getValue(): string {
		return DateParser.stringify(this.date);
	}

	public setValue(value: string): void {
		this.date = DateParser.parse(value);
		// console.log(this.date);
		this.monthComponent.setValue(this.date.getMonth().toString());
		this.dayComponent.setValue(this.date.getDay().toString());
		this.yearComponent.setValue(this.date.getYear().toString());
	}

	public isEqualValue(value: any): boolean {
		return value == this.getValue();
	}

	public getDefaultValue(): any {
		return DateParser.stringify(DateParser.getDefaultDate());
	}

	public render(container: HTMLDivElement): void {
		this.date = DateParser.parse(this.inputFieldMarkdownRenderChild.getInitialValue()) ?? DateParser.getDefaultDate();
		// console.log(this.date);

		container.removeClass('meta-bind-plugin-input-wrapper');
		container.addClass('meta-bind-plugin-flex-input-wrapper', 'meta-bind-plugin-input-element-group');

		if (DateParser.dateFormat === DateFormat.EU) {
			this.dayComponent = new DropdownComponent(container);
			this.dayComponent.addOptions(this.days);
			this.dayComponent.setValue(this.date.getDay().toString());
			this.dayComponent.onChange(this.onDayChange.bind(this));

			this.monthComponent = new DropdownComponent(container);
			this.monthComponent.addOptions(this.months);
			this.monthComponent.setValue(this.date.getMonth().toString());
			this.monthComponent.onChange(this.onMonthChange.bind(this));

			this.dayComponent.selectEl.addClass('meta-bind-plugin-input-element-group-element');
			this.monthComponent.selectEl.addClass('meta-bind-plugin-input-element-group-element');
		} else {
			this.monthComponent = new DropdownComponent(container);
			this.monthComponent.addOptions(this.months);
			this.monthComponent.setValue(this.date.getMonth().toString());
			this.monthComponent.onChange(this.onMonthChange.bind(this));

			this.dayComponent = new DropdownComponent(container);
			this.dayComponent.addOptions(this.days);
			this.dayComponent.setValue(this.date.getDay().toString());
			this.dayComponent.onChange(this.onDayChange.bind(this));

			this.dayComponent.selectEl.addClass('meta-bind-plugin-input-element-group-element');
			this.monthComponent.selectEl.addClass('meta-bind-plugin-input-element-group-element');
		}

		this.yearComponent = new TextComponent(container);
		this.yearComponent.setValue(this.date.getYear().toString());
		this.yearComponent.onChange(this.onYearChange.bind(this));

		this.yearComponent.inputEl.addClass('meta-bind-plugin-date-input-year-input');
		this.yearComponent.inputEl.addClass('meta-bind-plugin-input-element-group-element');
		this.yearComponent.inputEl.type = 'number';
		this.yearComponent.inputEl.max = '9999';

		this.container = container;
	}

	private onMonthChange(value: string): void {
		// console.log(value);
		this.date.setMonthFromString(value);
		this.onValueChange(this.getValue());
	}

	private onDayChange(value: string): void {
		this.date.setDayFromString(value);
		this.onValueChange(this.getValue());
	}

	private onYearChange(value: string): void {
		this.date.setYearFromString(value);
		this.onValueChange(this.getValue());
	}

}

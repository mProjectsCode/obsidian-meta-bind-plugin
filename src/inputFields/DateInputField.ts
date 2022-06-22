import {AbstractInputField} from './AbstractInputField';
import {DropdownComponent} from 'obsidian';
import {InputFieldMarkdownRenderChild} from '../InputFieldMarkdownRenderChild';

export class DateInputField extends AbstractInputField {
	container: HTMLDivElement;
	month: string;
	day: string;
	year: string;

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
	}
	days: Record<string, string>;
	years: Record<string, string>;

	monthComponent: DropdownComponent;
	dayComponent: DropdownComponent;
	yearComponent: DropdownComponent;


	constructor(inputFieldMarkdownRenderChild: InputFieldMarkdownRenderChild, onValueChange: (value: any) => (void | Promise<void>)) {
		super(inputFieldMarkdownRenderChild, onValueChange);

		this.days = {};
		for (let i = 0; i < 31; i++) {
			this.days[i.toString()] = i.toString();
		}

		this.years = {};
		for (let i = 1970; i < 2030; i++) {
			this.years[i.toString()] = i.toString();
		}
	}

	public getHtmlElement(): HTMLElement {
		return this.container;
	}

	public getValue(): string {
		return `${this.month}/${this.day}/${this.year}`;
	}

	public setValue(value: string): void {
		const valueParts = value.split('/');
		if (valueParts.length !== 3) {
			return;
		}
		this.month = valueParts[0];
		this.monthComponent.setValue(this.month);

		this.day = valueParts[1];
		this.dayComponent.setValue(this.day);

		this.year = valueParts[2];
		this.yearComponent.setValue(this.year);
	}

	public isEqualValue(value: any): boolean {
		return value == this.getValue();
	}

	public getDefaultValue(): any {
		return `1/1/2022`;
	}

	private onMonthChange(value: string): void {
		this.month = value;
		this.onValueChange(this.getValue());
	}

	private onDayChange(value: string): void {
		this.day = value;
		this.onValueChange(this.getValue());
	}

	private onYearChange(value: string): void {
		this.year = value;
		this.onValueChange(this.getValue());
	}

	public render(container: HTMLDivElement): void {
		this.monthComponent = new DropdownComponent(container);
		this.monthComponent.addOptions(this.months);
		this.monthComponent.setValue(this.month);
		this.monthComponent.onChange(this.onMonthChange.bind(this));

		this.dayComponent = new DropdownComponent(container);
		this.dayComponent.addOptions(this.days);
		this.dayComponent.setValue(this.day);
		this.dayComponent.onChange(this.onDayChange.bind(this))

		this.yearComponent = new DropdownComponent(container);
		this.yearComponent.addOptions(this.years);
		this.yearComponent.setValue(this.year);
		this.yearComponent.onChange(this.onYearChange.bind(this))

		this.container = container;
	}

}

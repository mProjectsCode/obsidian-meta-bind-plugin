import { AbstractInputField } from './AbstractInputField';
import { DropdownComponent } from 'obsidian';
import { InputFieldMarkdownRenderChild } from '../InputFieldMarkdownRenderChild';
import { Time, TimeParser } from '../parsers/TimeParser';
import { MetaBindInternalError, MetaBindValueError } from '../utils/MetaBindErrors';

export class TimeInputField extends AbstractInputField {
	container: HTMLDivElement | undefined;
	time: Time | undefined;

	hours: Record<string, string>;
	minutes: Record<string, string>;

	hourComponent: DropdownComponent | undefined;
	minuteComponent: DropdownComponent | undefined;

	constructor(inputFieldMarkdownRenderChild: InputFieldMarkdownRenderChild, onValueChange: (value: any) => void | Promise<void>) {
		super(inputFieldMarkdownRenderChild, onValueChange);

		this.time = TimeParser.getDefaultTime();

		this.hours = {};
		for (let i = 0; i <= 24; i++) {
			this.hours[i.toString()] = i.toString();
		}

		this.minutes = {};
		for (let i = 0; i <= 59; i++) {
			this.minutes[i.toString()] = i.toString();
		}
	}

	public getHtmlElement(): HTMLElement {
		if (!this.container) {
			throw new MetaBindInternalError('time input container is undefined');
		}

		return this.container;
	}

	public getValue(): string {
		return TimeParser.stringify(this.time as Time);
	}

	public setValue(value: string): void {
		if (!this.hourComponent) {
			throw new MetaBindInternalError('time input hour component is undefined');
		}
		if (!this.minuteComponent) {
			throw new MetaBindInternalError('time input minute component is undefined');
		}

		this.time = TimeParser.parse(value);
		if (!this.time) {
			console.warn(new MetaBindValueError(`invalid value '${value}' at timeInputField ${this.inputFieldMarkdownRenderChild.uuid}`));
			this.time = TimeParser.getDefaultTime();
		}
		// console.log(this.time);
		this.hourComponent.setValue(this.time.getHour().toString());
		this.minuteComponent.setValue(this.time.getMinute().toString());
	}

	public isEqualValue(value: any): boolean {
		return value == this.getValue();
	}

	public getDefaultValue(): string {
		return TimeParser.stringify(TimeParser.getDefaultTime());
	}

	public render(container: HTMLDivElement): void {
		console.debug(`meta-bind | TimeInputField >> render ${this.inputFieldMarkdownRenderChild.uuid}`);

		this.time = TimeParser.parse(this.inputFieldMarkdownRenderChild.getInitialValue()) ?? TimeParser.getDefaultTime();

		container.removeClass('meta-bind-plugin-input-wrapper');
		container.addClass('meta-bind-plugin-flex-input-wrapper', 'meta-bind-plugin-input-element-group');

		this.hourComponent = new DropdownComponent(container);
		this.hourComponent.addOptions(this.hours);
		this.hourComponent.setValue(this.time.getHour().toString());
		this.hourComponent.onChange(this.onHourChange.bind(this));

		this.minuteComponent = new DropdownComponent(container);
		this.minuteComponent.addOptions(this.minutes);
		this.minuteComponent.setValue(this.time.getMinute().toString());
		this.minuteComponent.onChange(this.onMinuteChange.bind(this));

		this.hourComponent.selectEl.addClass('meta-bind-plugin-input-element-group-element');
		this.minuteComponent.selectEl.addClass('meta-bind-plugin-input-element-group-element');

		this.container = container;
	}

	public destroy(): void {}

	private onHourChange(value: string): void {
		this.time?.setHourFromString(value);
		this.onValueChange(this.getValue());
	}

	private onMinuteChange(value: string): void {
		this.time?.setMinuteFromString(value);
		this.onValueChange(this.getValue());
	}
}

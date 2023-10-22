import { AbstractInputField } from '../AbstractInputField';
import { DropdownComponent } from 'obsidian';
import { Time, TimeParser } from '../../parsers/TimeParser';
import { ErrorLevel, MetaBindInternalError, MetaBindValueError } from '../../utils/errors/MetaBindErrors';
import { InputFieldMDRC } from '../../renderChildren/InputFieldMDRC';
import { MBExtendedLiteral, stringifyLiteral } from '../../utils/Utils';

type T = string;

export class TimeInputField extends AbstractInputField<T> {
	container: HTMLDivElement | undefined;
	time: Time | undefined;

	hours: Record<string, string>;
	minutes: Record<string, string>;

	hourComponent: DropdownComponent | undefined;
	minuteComponent: DropdownComponent | undefined;

	constructor(inputFieldMDRC: InputFieldMDRC) {
		super(inputFieldMDRC);

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
			throw new MetaBindInternalError(
				ErrorLevel.WARNING,
				'failed to get html element for input field',
				"container is undefined, field hasn't been rendered yet",
			);
		}

		return this.container;
	}

	public getValue(): T | undefined {
		if (!this.hourComponent) {
			return undefined;
		}
		if (!this.minuteComponent) {
			return undefined;
		}
		if (this.time === undefined) {
			return undefined;
		}

		return TimeParser.stringify(this.time);
	}

	public filterValue(value: MBExtendedLiteral | undefined): T | undefined {
		if (value == null || typeof value !== 'string') {
			return undefined;
		}
		const strValue = stringifyLiteral(value);
		return TimeParser.parse(strValue) ? strValue : undefined;
	}

	public updateDisplayValue(value: T): void {
		if (!this.hourComponent) {
			return;
		}
		if (!this.minuteComponent) {
			return;
		}

		this.time = TimeParser.parse(value);
		if (!this.time) {
			console.warn(
				new MetaBindValueError(ErrorLevel.WARNING, 'failed to set value', `invalid value '${value}' at timeInputField ${this.renderChild.uuid}`),
			);
			this.time = TimeParser.getDefaultTime();
		}
		// console.log(this.time);
		this.hourComponent.setValue(this.time.getHour().toString());
		this.minuteComponent.setValue(this.time.getMinute().toString());
	}

	public isEqualValue(value: T | undefined): boolean {
		return value == this.getValue();
	}

	public getFallbackDefaultValue(): T {
		return TimeParser.stringify(TimeParser.getDefaultTime());
	}

	public render(container: HTMLDivElement): void {
		console.debug(`meta-bind | TimeInputField >> render ${this.renderChild.uuid}`);

		this.time = TimeParser.parse(this.getInitialValue() ?? this.getDefaultValue()) ?? TimeParser.getDefaultTime();

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

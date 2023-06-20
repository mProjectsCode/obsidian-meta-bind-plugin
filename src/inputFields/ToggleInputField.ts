import { AbstractInputField } from './AbstractInputField';
import { ToggleComponent } from 'obsidian';
import { ErrorLevel, MetaBindInternalError, MetaBindValueError } from '../utils/errors/MetaBindErrors';
import { InputFieldMDRC } from '../renderChildren/InputFieldMDRC';
import { InputFieldArgumentType } from '../parsers/InputFieldDeclarationParser';

export class ToggleInputField extends AbstractInputField {
	toggleComponent: ToggleComponent | undefined;
	onValue: boolean | string | number;
	offValue: boolean | string | number;

	constructor(inputFieldMDRC: InputFieldMDRC) {
		super(inputFieldMDRC);

		this.onValue = this.renderChild.getArgument(InputFieldArgumentType.ON_VALUE)?.value ?? true;
		this.offValue = this.renderChild.getArgument(InputFieldArgumentType.OFF_VALUE)?.value ?? false;
	}

	getValue(): boolean | string | number | undefined {
		if (!this.toggleComponent) {
			return undefined;
		}
		return this.mapValue(this.toggleComponent.getValue());
	}

	setValue(value: any): void {
		if (!this.toggleComponent) {
			return;
		}

		this.toggleComponent.setValue(this.reverseMapValue(value));
	}

	isEqualValue(value: any): boolean {
		return this.getValue() == value;
	}

	getDefaultValue(): boolean | string | number {
		return this.offValue;
	}

	getHtmlElement(): HTMLElement {
		if (!this.toggleComponent) {
			throw new MetaBindInternalError(ErrorLevel.WARNING, 'failed to get html element for input field', "container is undefined, field hasn't been rendered yet");
		}

		return this.toggleComponent.toggleEl;
	}

	render(container: HTMLDivElement): void {
		console.debug(`meta-bind | ToggleInputField >> render ${this.renderChild.uuid}`);

		const component = new ToggleComponent(container);
		component.setValue(this.reverseMapValue(this.renderChild.getInitialValue()));
		component.onChange((value: boolean) => this.onValueChange(this.mapValue(value)));
		this.toggleComponent = component;
	}

	mapValue(value: boolean): boolean | string | number {
		return value ? this.onValue : this.offValue;
	}

	reverseMapValue(value: boolean | string | number): boolean {
		if (value === this.onValue) {
			return true;
		} else if (value === this.offValue) {
			return false;
		} else {
			console.warn(new MetaBindValueError(ErrorLevel.WARNING, 'failed to reverse map value', `invalid value '${value}' at toggleInputField ${this.renderChild.uuid}`));
			return false;
		}
	}

	public destroy(): void {}
}

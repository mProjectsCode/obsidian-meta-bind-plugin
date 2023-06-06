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

		if (value === this.onValue) {
			this.toggleComponent.setValue(true);
		} else if (value === this.offValue) {
			this.toggleComponent.setValue(false);
		} else {
			console.warn(new MetaBindValueError(ErrorLevel.WARNING, 'failed to set value', `invalid value '${value}' at toggleInputField ${this.renderChild.uuid}`));
			this.toggleComponent.setValue(false);
		}
	}

	isEqualValue(value: any): boolean {
		return this.getValue() == value;
	}

	getDefaultValue(): boolean {
		return false;
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
		component.setValue(this.renderChild.getInitialValue());
		component.onChange((value: boolean) => this.onValueChange(this.mapValue(value)));
		this.toggleComponent = component;
	}

	mapValue(value: boolean): boolean | string | number {
		return value ? this.onValue : this.offValue;
	}

	public destroy(): void {}
}

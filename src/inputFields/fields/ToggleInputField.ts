import { AbstractInputField } from '../AbstractInputField';
import { ToggleComponent } from 'obsidian';
import { ErrorLevel, MetaBindInternalError, MetaBindValueError } from '../../utils/errors/MetaBindErrors';
import { InputFieldMDRC } from '../../renderChildren/InputFieldMDRC';
import { isLiteral, MBExtendedLiteral, MBLiteral } from '../../utils/Utils';
import { InputFieldArgumentType } from '../../parsers/inputFieldParser/InputFieldConfigs';

type T = MBLiteral;

export class ToggleInputField extends AbstractInputField<T> {
	toggleComponent: ToggleComponent | undefined;
	onValue: MBLiteral;
	offValue: MBLiteral;

	constructor(inputFieldMDRC: InputFieldMDRC) {
		super(inputFieldMDRC);

		this.onValue = this.renderChild.getArgument(InputFieldArgumentType.ON_VALUE)?.value ?? true;
		this.offValue = this.renderChild.getArgument(InputFieldArgumentType.OFF_VALUE)?.value ?? false;
	}

	getValue(): MBLiteral | undefined {
		if (!this.toggleComponent) {
			return undefined;
		}
		return this.mapValue(this.toggleComponent.getValue());
	}

	filterValue(value: MBExtendedLiteral | undefined): T | undefined {
		return isLiteral(value) ? value : undefined;
	}

	updateDisplayValue(value: T): void {
		this.toggleComponent?.setValue(this.reverseMapValue(value));
	}

	isEqualValue(value: T | undefined): boolean {
		return this.getValue() == value;
	}

	getFallbackDefaultValue(): MBLiteral {
		return this.offValue;
	}

	getHtmlElement(): HTMLElement {
		if (!this.toggleComponent) {
			throw new MetaBindInternalError(
				ErrorLevel.WARNING,
				'failed to get html element for input field',
				"container is undefined, field hasn't been rendered yet",
			);
		}

		return this.toggleComponent.toggleEl;
	}

	render(container: HTMLDivElement): void {
		console.debug(`meta-bind | ToggleInputField >> render ${this.renderChild.uuid}`);

		const component = new ToggleComponent(container);
		component.setValue(this.reverseMapValue(this.getInitialValue()));
		component.onChange((value: boolean) => this.onValueChange(this.mapValue(value)));
		this.toggleComponent = component;
	}

	mapValue(value: boolean): MBLiteral {
		return value ? this.onValue : this.offValue;
	}

	reverseMapValue(value: MBLiteral | undefined): boolean {
		if (value === this.onValue) {
			return true;
		} else if (value === this.offValue) {
			return false;
		} else {
			console.warn(
				new MetaBindValueError(
					ErrorLevel.WARNING,
					'failed to reverse map value',
					`invalid value '${value}' at toggleInputField ${this.renderChild.uuid}`,
				),
			);
			return false;
		}
	}

	public destroy(): void {}
}

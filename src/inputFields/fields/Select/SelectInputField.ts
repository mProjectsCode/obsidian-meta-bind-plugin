import { isLiteral, MBExtendedLiteral, MBLiteral } from '../../../utils/Utils';
import { InputFieldMDRC } from '../../../renderChildren/InputFieldMDRC';
import { AbstractSelectInputField } from './AbstractSelectInputField';

type T = MBLiteral;

export class SelectInputField extends AbstractSelectInputField<T> {
	constructor(inputFieldMDRC: InputFieldMDRC) {
		super(inputFieldMDRC);

		this.allowMultiSelect = false;
	}

	getValue(): MBLiteral | undefined {
		if (!this.container) {
			return undefined;
		}
		return this.elements.filter(x => x.isActive()).first()?.value ?? null;
	}

	filterValue(value: MBExtendedLiteral | undefined): T | undefined {
		return isLiteral(value) ? value : undefined;
	}

	updateDisplayValue(value: T): void {
		for (const element of this.elements) {
			if (value === element.value) {
				element.setActive(true, false);
			} else {
				element.setActive(false, false);
			}
		}
	}

	isEqualValue(value: T | undefined): boolean {
		return this.getValue() == value;
	}

	getFallbackDefaultValue(): T {
		return '';
	}
}

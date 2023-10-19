import { areArraysEqual, MBExtendedLiteral, MBLiteral } from '../../../utils/Utils';
import { InputFieldMDRC } from '../../../renderChildren/InputFieldMDRC';
import { AbstractSelectInputField } from './AbstractSelectInputField';

type T = MBLiteral[];

export class MultiSelectInputField extends AbstractSelectInputField<T> {
	constructor(inputFieldMDRC: InputFieldMDRC) {
		super(inputFieldMDRC);
		this.allowMultiSelect = true;
	}

	getValue(): T | undefined {
		if (!this.container) {
			return undefined;
		}
		return this.elements.filter(x => x.isActive()).map(x => x.value);
	}

	filterValue(value: MBExtendedLiteral | undefined): T | undefined {
		if (value == null) {
			return undefined;
		}

		if (Array.isArray(value)) {
			return value;
		} else {
			return [value];
		}
	}

	updateDisplayValue(value: T): void {
		if (value.length === 0) {
			for (const element of this.elements) {
				element.setActive(false, false);
			}
			return;
		}

		elementLoop: for (const element of this.elements) {
			for (const valueElement of value) {
				if (valueElement === element.value) {
					element.setActive(true, false);
					continue elementLoop;
				}
			}
			element.setActive(false, false);
		}
	}

	isEqualValue(value: T | undefined): boolean {
		if (!Array.isArray(value)) {
			return false;
		}

		return areArraysEqual(this.getValue(), value);
	}

	getFallbackDefaultValue(): T {
		return [];
	}
}

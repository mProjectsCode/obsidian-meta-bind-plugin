import { SelectInputField } from './SelectInputField';
import { doArraysContainEqualValues, MBLiteral } from '../../utils/Utils';
import { InputFieldMDRC } from '../../renderChildren/InputFieldMDRC';

export class MultiSelectInputField extends SelectInputField {
	constructor(inputFieldMDRC: InputFieldMDRC) {
		super(inputFieldMDRC);
		this.allowMultiSelect = true;
	}

	getValue(): any {
		if (!this.container) {
			return undefined;
		}
		return this.elements.filter(x => x.isActive()).map(x => x.value);
	}

	setValue(value: MBLiteral[]): void {
		if (!value || value.length === 0) {
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

	isEqualValue(value: any): boolean {
		if (!Array.isArray(value)) {
			return false;
		}

		return doArraysContainEqualValues(this.getValue(), value);
	}

	getDefaultValue(): MBLiteral[] {
		return [];
	}
}

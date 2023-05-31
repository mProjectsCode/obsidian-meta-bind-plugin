import { SelectInputField } from './SelectInputField';
import { InputFieldMarkdownRenderChild } from '../InputFieldMarkdownRenderChild';
import { doArraysContainEqualValues } from '../utils/Utils';

export class MultiSelectInputField extends SelectInputField {
	constructor(inputFieldMarkdownRenderChild: InputFieldMarkdownRenderChild) {
		super(inputFieldMarkdownRenderChild);
		this.allowMultiSelect = true;
	}

	getValue(): any {
		if (!this.container) {
			return undefined;
		}
		return this.elements.filter(x => x.isActive()).map(x => x.value);
	}

	setValue(value: string[]): void {
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

	getDefaultValue(): string[] {
		return [];
	}
}

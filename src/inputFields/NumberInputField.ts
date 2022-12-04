import { AbstractInputField } from './AbstractInputField';
import { TextComponent } from 'obsidian';
import { numberToString } from '../utils/Utils';
import { MetaBindInternalError, MetaBindValueError } from '../utils/MetaBindErrors';

export class NumberInputField extends AbstractInputField {
	numberComponent: TextComponent | undefined;

	getValue(): number {
		if (!this.numberComponent) {
			throw new MetaBindInternalError('number input component is undefined');
		}
		const value = parseFloat(this.numberComponent.getValue());
		return isNaN(value) ? 0 : value;
	}

	setValue(value: any): void {
		if (!this.numberComponent) {
			throw new MetaBindInternalError('number input component is undefined');
		}

		if (value != null && (typeof value == 'number' || typeof value == 'string')) {
			this.numberComponent.setValue(numberToString(value));
		} else {
			console.warn(new MetaBindValueError(`invalid value '${value}' at numberInputField ${this.inputFieldMarkdownRenderChild.uuid}`));
			this.numberComponent.setValue(this.getDefaultValue());
		}
	}

	isEqualValue(value: any): boolean {
		return this.getValue() == value;
	}

	getDefaultValue(): any {
		return 0;
	}

	getHtmlElement(): HTMLElement {
		if (!this.numberComponent) {
			throw new MetaBindInternalError('number input component is undefined');
		}

		return this.numberComponent.inputEl;
	}

	render(container: HTMLDivElement): void {
		console.debug(`meta-bind | render numberInputField ${this.inputFieldMarkdownRenderChild.uuid}`);

		const component = new TextComponent(container);
		component.inputEl.type = 'number';
		component.setValue(numberToString(this.inputFieldMarkdownRenderChild.getInitialValue()));
		component.onChange(value => {
			const n = parseFloat(value);
			this.onValueChange(isNaN(n) ? 0 : n);
		});
		this.numberComponent = component;
	}
}

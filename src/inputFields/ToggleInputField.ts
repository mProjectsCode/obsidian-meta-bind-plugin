import { AbstractInputField } from './AbstractInputField';
import { ToggleComponent } from 'obsidian';
import { MetaBindBindValueError, MetaBindInternalError } from '../utils/Utils';

export class ToggleInputField extends AbstractInputField {
	toggleComponent: ToggleComponent | undefined;

	getValue(): boolean {
		if (!this.toggleComponent) {
			throw new MetaBindInternalError('toggle input component is undefined');
		}
		return this.toggleComponent.getValue();
	}

	setValue(value: any): void {
		if (!this.toggleComponent) {
			throw new MetaBindInternalError('toggle input component is undefined');
		}

		if (value != null && typeof value == 'boolean') {
			this.toggleComponent.setValue(value);
		} else {
			console.warn(new MetaBindBindValueError(`invalid value '${value}' at toggleInputField ${this.inputFieldMarkdownRenderChild.uid}`));
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
			throw new MetaBindInternalError('toggle input component is undefined');
		}

		return this.toggleComponent.toggleEl;
	}

	render(container: HTMLDivElement): void {
		console.debug(`meta-bind | render toggleInputField ${this.inputFieldMarkdownRenderChild.uid}`);

		const component = new ToggleComponent(container);
		component.setValue(this.inputFieldMarkdownRenderChild.getInitialValue());
		component.onChange(this.onValueChange);
		this.toggleComponent = component;
	}
}

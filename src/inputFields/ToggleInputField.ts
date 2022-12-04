import { AbstractInputField } from './AbstractInputField';
import { ToggleComponent } from 'obsidian';
import { MetaBindInternalError, MetaBindValueError } from '../utils/MetaBindErrors';

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
			console.warn(new MetaBindValueError(`invalid value '${value}' at toggleInputField ${this.inputFieldMarkdownRenderChild.uuid}`));
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
		console.debug(`meta-bind | ToggleInputField >> render ${this.inputFieldMarkdownRenderChild.uuid}`);

		const component = new ToggleComponent(container);
		component.setValue(this.inputFieldMarkdownRenderChild.getInitialValue());
		component.onChange(this.onValueChange);
		this.toggleComponent = component;
	}
}

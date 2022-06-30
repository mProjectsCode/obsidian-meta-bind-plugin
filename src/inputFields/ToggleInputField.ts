import {AbstractInputField} from './AbstractInputField';
import {ToggleComponent} from 'obsidian';
import {Logger} from '../utils/Logger';
import {MetaBindInternalError} from '../utils/Utils';

export class ToggleInputField extends AbstractInputField {
	toggleComponent: ToggleComponent | undefined;

	getValue(): any {
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
			Logger.logWarning(`can not set value of toggle to \'${value}\'`);
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
		const component = new ToggleComponent(container);
		component.setValue(this.inputFieldMarkdownRenderChild.getInitialValue());
		component.onChange(this.onValueChange);
		this.toggleComponent = component;
	}

}

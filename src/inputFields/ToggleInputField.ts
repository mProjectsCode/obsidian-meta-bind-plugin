import {AbstractInputField} from './AbstractInputField';
import {ToggleComponent} from 'obsidian';
import {Logger} from '../utils/Logger';

export class ToggleInputField extends AbstractInputField {
	toggleComponent: ToggleComponent;

	getValue(): any {
		return this.toggleComponent.getValue();
	}

	setValue(value: any): void {
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

	getDefaultValue(): any {
		return false;
	}

	getHtmlElement(): HTMLElement {
		return this.toggleComponent.toggleEl;
	}

	render(container: HTMLDivElement): void {
		const component = new ToggleComponent(container);
		component.setValue(this.inputFieldMarkdownRenderChild.getInitialValue());
		component.onChange(this.onValueChange);
		this.toggleComponent = component;
	}

}

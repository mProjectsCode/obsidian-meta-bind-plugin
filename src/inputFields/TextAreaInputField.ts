import {AbstractInputField} from './AbstractInputField';
import {TextAreaComponent} from 'obsidian';
import {Logger} from '../utils/Logger';

export class TextAreaInputField extends AbstractInputField {
	textAreaComponent: TextAreaComponent;

	getValue(): any {
		return this.textAreaComponent.getValue();
	}

	setValue(value: any): void {
		if (value != null && typeof value == 'string') {
			this.textAreaComponent.setValue(value);
		} else {
			Logger.logWarning(`can not set value of text area input to \'${value}\'`);
			this.textAreaComponent.setValue('');
		}
	}

	isEqualValue(value: any): boolean {
		return this.getValue() == value;
	}

	getDefaultValue(): any {
		return '';
	}

	getHtmlElement(): HTMLElement {
		return this.textAreaComponent.inputEl;
	}

	render(container: HTMLDivElement): void {
		const component = new TextAreaComponent(container);
		component.setValue(this.inputFieldMarkdownRenderChild.getInitialValue());
		component.onChange(this.onValueChange);
		this.textAreaComponent = component;
	}

}

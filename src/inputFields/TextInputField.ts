import {AbstractInputField} from './AbstractInputField';
import {TextComponent} from 'obsidian';
import {Logger} from '../utils/Logger';

export class TextInputField extends AbstractInputField {
	textComponent: TextComponent;

	getValue(): any {
		return this.textComponent.getValue();
	}

	setValue(value: any): void {
		if (value != null && typeof value == 'string') {
			this.textComponent.setValue(value);
		} else {
			Logger.logWarning(`can not set value of text input to \'${value}\'`);
			this.textComponent.setValue('');
		}
	}

	isEqualValue(value: any): boolean {
		return this.getValue() == value;
	}

	getDefaultValue(): any {
		return '';
	}

	getHtmlElement(): HTMLElement {
		return this.textComponent.inputEl;
	}

	render(container: HTMLDivElement): void {
		const component = new TextComponent(container);
		component.setValue(this.inputFieldMarkdownRenderChild.getInitialValue());
		component.onChange(this.onValueChange);
		this.textComponent = component;
	}

}

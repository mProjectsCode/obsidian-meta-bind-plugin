import { AbstractInputField } from './AbstractInputField';
import { TextAreaComponent } from 'obsidian';
import { Logger } from '../utils/Logger';
import { MetaBindInternalError } from '../utils/Utils';

export class TextAreaInputField extends AbstractInputField {
	textAreaComponent: TextAreaComponent | undefined;

	getValue(): any {
		if (!this.textAreaComponent) {
			throw new MetaBindInternalError('text area input component is undefined');
		}

		return this.textAreaComponent.getValue();
	}

	setValue(value: any): void {
		if (!this.textAreaComponent) {
			throw new MetaBindInternalError('text area input component is undefined');
		}

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
		if (!this.textAreaComponent) {
			throw new MetaBindInternalError('text area input component is undefined');
		}

		return this.textAreaComponent.inputEl;
	}

	render(container: HTMLDivElement): void {
		const component = new TextAreaComponent(container);
		component.setValue(this.inputFieldMarkdownRenderChild.getInitialValue());
		component.onChange(this.onValueChange);
		this.textAreaComponent = component;
	}
}

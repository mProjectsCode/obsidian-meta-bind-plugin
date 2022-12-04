import { AbstractInputField } from './AbstractInputField';
import { TextAreaComponent } from 'obsidian';
import { MetaBindInternalError, MetaBindValueError } from '../utils/MetaBindErrors';

export class TextAreaInputField extends AbstractInputField {
	textAreaComponent: TextAreaComponent | undefined;

	getValue(): string {
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
			console.warn(new MetaBindValueError(`invalid value '${value}' at textAreaInputField ${this.inputFieldMarkdownRenderChild.uuid}`));
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
		console.debug(`meta-bind | render textAreaInputField ${this.inputFieldMarkdownRenderChild.uuid}`);

		const component = new TextAreaComponent(container);
		component.setValue(this.inputFieldMarkdownRenderChild.getInitialValue());
		component.onChange(this.onValueChange);
		this.textAreaComponent = component;
	}
}

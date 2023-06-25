import { AbstractInputField } from '../AbstractInputField';
import { TextAreaComponent } from 'obsidian';
import { ErrorLevel, MetaBindInternalError, MetaBindValueError } from '../../utils/errors/MetaBindErrors';

export class TextAreaInputField extends AbstractInputField {
	textAreaComponent: TextAreaComponent | undefined;

	getValue(): string | undefined {
		if (!this.textAreaComponent) {
			return undefined;
		}

		return this.textAreaComponent.getValue();
	}

	setValue(value: any): void {
		if (!this.textAreaComponent) {
			return;
		}

		if (value != null && typeof value == 'string') {
			this.textAreaComponent.setValue(value);
		} else {
			console.warn(new MetaBindValueError(ErrorLevel.WARNING, 'failed to set value', `invalid value '${value}' at textAreaInputField ${this.renderChild.uuid}`));
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
			throw new MetaBindInternalError(ErrorLevel.WARNING, 'failed to get html element for input field', "container is undefined, field hasn't been rendered yet");
		}

		return this.textAreaComponent.inputEl;
	}

	render(container: HTMLDivElement): void {
		console.debug(`meta-bind | TextAreaInputField >> render ${this.renderChild.uuid}`);

		const component = new TextAreaComponent(container);
		component.setValue(this.renderChild.getInitialValue());
		component.onChange(this.onValueChange);
		this.textAreaComponent = component;
	}

	public destroy(): void {}
}

import { AbstractInputField } from './AbstractInputField';
import { TextComponent } from 'obsidian';
import { MetaBindInternalError, MetaBindValueError } from '../utils/MetaBindErrors';

export class TextInputField extends AbstractInputField {
	textComponent: TextComponent | undefined;

	getValue(): string | undefined {
		if (!this.textComponent) {
			return undefined;
		}

		return this.textComponent.getValue();
	}

	setValue(value: any): void {
		if (!this.textComponent) {
			return;
		}

		if (value != null && typeof value == 'string') {
			this.textComponent.setValue(value);
		} else {
			console.warn(new MetaBindValueError(`invalid value '${value}' at textInputField ${this.renderChild.uuid}`));
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
		if (!this.textComponent) {
			throw new MetaBindInternalError('text input component is undefined');
		}

		return this.textComponent.inputEl;
	}

	render(container: HTMLDivElement): void {
		console.debug(`meta-bind | TextInputField >> render ${this.renderChild.uuid}`);

		const component = new TextComponent(container);
		component.setValue(this.renderChild.getInitialValue());
		component.onChange(this.onValueChange);
		this.textComponent = component;
	}

	public destroy(): void {}
}

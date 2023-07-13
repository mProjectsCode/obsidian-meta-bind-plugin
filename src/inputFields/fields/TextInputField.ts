import { AbstractInputField } from '../AbstractInputField';
import { TextComponent } from 'obsidian';
import { ErrorLevel, MetaBindInternalError } from '../../utils/errors/MetaBindErrors';
import { MBExtendedLiteral, stringifyLiteral } from '../../utils/Utils';

type T = string;

export class TextInputField extends AbstractInputField<T> {
	textComponent: TextComponent | undefined;

	getValue(): T | undefined {
		if (!this.textComponent) {
			return undefined;
		}

		return this.textComponent.getValue();
	}

	filterValue(value: MBExtendedLiteral | undefined): T {
		return value != null ? stringifyLiteral(value) : this.getDefaultValue();
	}

	updateDisplayValue(value: T): void {
		this.textComponent?.setValue(value ?? this.getDefaultValue());
	}

	isEqualValue(value: T): boolean {
		return this.getValue() == value;
	}

	getDefaultValue(): string {
		return '';
	}

	getHtmlElement(): HTMLElement {
		if (!this.textComponent) {
			throw new MetaBindInternalError(ErrorLevel.WARNING, 'failed to get html element for input field', "container is undefined, field hasn't been rendered yet");
		}

		return this.textComponent.inputEl;
	}

	render(container: HTMLDivElement): void {
		console.debug(`meta-bind | TextInputField >> render ${this.renderChild.uuid}`);

		const component = new TextComponent(container);
		component.setValue(this.getInitialValue() ?? this.getDefaultValue());
		component.onChange(this.onValueChange);
		this.textComponent = component;
	}

	public destroy(): void {}
}

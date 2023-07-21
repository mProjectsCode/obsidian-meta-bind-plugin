import { AbstractInputField } from '../AbstractInputField';
import { TextAreaComponent } from 'obsidian';
import { ErrorLevel, MetaBindInternalError } from '../../utils/errors/MetaBindErrors';
import { MBExtendedLiteral, stringifyLiteral } from '../../utils/Utils';

type T = string;

export class TextAreaInputField extends AbstractInputField<T> {
	textAreaComponent: TextAreaComponent | undefined;

	getValue(): T | undefined {
		if (!this.textAreaComponent) {
			return undefined;
		}

		return this.textAreaComponent.getValue();
	}

	filterValue(value: MBExtendedLiteral | undefined): T | undefined {
		return value != null ? stringifyLiteral(value) : undefined;
	}

	updateDisplayValue(value: T): void {
		this.textAreaComponent?.setValue(value ?? this.getDefaultValue());
	}

	isEqualValue(value: T): boolean {
		return this.getValue() == value;
	}

	getFallbackDefaultValue(): string {
		return '';
	}

	getHtmlElement(): HTMLElement {
		if (!this.textAreaComponent) {
			throw new MetaBindInternalError(
				ErrorLevel.WARNING,
				'failed to get html element for input field',
				"container is undefined, field hasn't been rendered yet"
			);
		}

		return this.textAreaComponent.inputEl;
	}

	render(container: HTMLDivElement): void {
		console.debug(`meta-bind | TextAreaInputField >> render ${this.renderChild.uuid}`);

		const component = new TextAreaComponent(container);
		component.setValue(this.getInitialValue());
		component.onChange(this.onValueChange);
		this.textAreaComponent = component;
	}

	public destroy(): void {}
}

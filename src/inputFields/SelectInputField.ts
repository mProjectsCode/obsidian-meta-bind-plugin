import {AbstractInputField} from './AbstractInputField';
import {SelectInputFieldElement} from './SelectInputFieldElement';
import {mod} from '../utils/Utils';
import {InputFieldMarkdownRenderChild} from '../InputFieldMarkdownRenderChild';

export class SelectInputField extends AbstractInputField {
	static allowInlineCodeBlock: boolean = false;
	elements: SelectInputFieldElement[];
	allowMultiSelect: boolean;
	container: HTMLDivElement;

	constructor(inputFieldMarkdownRenderChild: InputFieldMarkdownRenderChild, onValueChange: (value: any) => (void | Promise<void>)) {
		super(inputFieldMarkdownRenderChild, onValueChange);
		this.elements = [];
		this.allowMultiSelect = false;
	}

	getHtmlElement(): HTMLElement {
		return this.container;
	}

	getValue(): string {
		return this.elements.filter(x => x.isActive()).first()?.value ?? '';
	}

	setValue(value: any): void {
		for (const element of this.elements) {
			if (value === element.value) {
				element.setActive(true, false);
			} else {
				element.setActive(false, false);
			}
		}
	}

	isEqualValue(value: any): boolean {
		return this.getValue() == value;
	}

	getDefaultValue(): any {
		return '';
	}

	onChange(): void {
		this.onValueChange(this.getValue());
	}

	render(container: HTMLDivElement): void {
		container.addClass('media-db-plugin-select-input-bg');
		this.container = container;

		const elementWrapper = container.createDiv({cls: 'media-db-plugin-select-input-wrapper'});

		const elementArguments: { name: string, value: string }[] = this.inputFieldMarkdownRenderChild.getArguments('option');

		let i = 0;
		for (const elementArgument of elementArguments) {
			const selectInputFieldElement = new SelectInputFieldElement(elementArgument.value, elementWrapper, i, this, false);

			this.elements.push(selectInputFieldElement);

			selectInputFieldElement.render();

			i += 1;
		}

		this.setValue(this.inputFieldMarkdownRenderChild.getInitialValue());
	}

	disableAllOtherElements(elementId: number) {
		for (const selectModalElement of this.elements) {
			if (selectModalElement.id !== elementId) {
				selectModalElement.setActive(false);
			}
		}
	}

	deHighlightAllOtherElements(elementId: number) {
		for (const selectModalElement of this.elements) {
			if (selectModalElement.id !== elementId) {
				selectModalElement.setHighlighted(false);
			}
		}
	}

	activateHighlighted() {
		for (const selectModalElement of this.elements) {
			if (selectModalElement.isHighlighted()) {
				selectModalElement.setActive(!selectModalElement.isActive());
				if (!this.allowMultiSelect) {
					this.disableAllOtherElements(selectModalElement.id);
				}
			}
		}
	}

	highlightUp() {
		for (const selectModalElement of this.elements) {
			if (selectModalElement.isHighlighted()) {
				this.getPreviousSelectModalElement(selectModalElement).setHighlighted(true);
				return;
			}
		}

		// nothing is highlighted
		this.elements.last().setHighlighted(true);
	}

	highlightDown() {
		for (const selectModalElement of this.elements) {
			if (selectModalElement.isHighlighted()) {
				this.getNextSelectModalElement(selectModalElement).setHighlighted(true);
				return;
			}
		}

		// nothing is highlighted
		this.elements.first().setHighlighted(true);
	}

	private getNextSelectModalElement(element: SelectInputFieldElement): SelectInputFieldElement {
		let nextId = element.id + 1;
		nextId = mod(nextId, this.elements.length);

		return this.elements.filter(x => x.id === nextId).first();
	}

	private getPreviousSelectModalElement(element: SelectInputFieldElement): SelectInputFieldElement {
		let nextId = element.id - 1;
		nextId = mod(nextId, this.elements.length);

		return this.elements.filter(x => x.id === nextId).first();
	}
}

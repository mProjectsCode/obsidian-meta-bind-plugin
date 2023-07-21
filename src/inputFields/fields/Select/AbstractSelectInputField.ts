import { AbstractInputField } from '../../AbstractInputField';
import { MBExtendedLiteral, mod } from '../../../utils/Utils';
import { SelectInputFieldElement } from './SelectInputFieldElement';
import { InputFieldMDRC } from '../../../renderChildren/InputFieldMDRC';
import { ErrorLevel, MetaBindInternalError } from '../../../utils/errors/MetaBindErrors';
import { OptionInputFieldArgument } from '../../../inputFieldArguments/arguments/OptionInputFieldArgument';
import { InputFieldArgumentType } from '../../../parsers/InputFieldDeclarationParser';

export abstract class AbstractSelectInputField<T extends MBExtendedLiteral> extends AbstractInputField<T> {
	elements: SelectInputFieldElement[];
	allowMultiSelect: boolean;
	container: HTMLDivElement | undefined;

	protected constructor(inputFieldMDRC: InputFieldMDRC) {
		super(inputFieldMDRC);
		this.elements = [];
		this.allowMultiSelect = false;
	}

	onChange(): void {
		this.onValueChange(this.getValue());
	}

	getHtmlElement(): HTMLElement {
		if (!this.container) {
			throw new MetaBindInternalError(
				ErrorLevel.WARNING,
				'failed to get html element for input field',
				"container is undefined, field hasn't been rendered yet"
			);
		}

		return this.container;
	}

	render(container: HTMLDivElement): void {
		console.debug(`meta-bind | SelectInputField >> render ${this.renderChild.uuid}`);
		this.container = container;

		const optionArguments: OptionInputFieldArgument[] = this.renderChild.getArguments(InputFieldArgumentType.OPTION) as OptionInputFieldArgument[];

		let i = 0;
		for (const optionArgument of optionArguments) {
			const selectInputFieldElement = new SelectInputFieldElement(optionArgument.value, optionArgument.name, container, i, this, false);

			this.elements.push(selectInputFieldElement);

			selectInputFieldElement.render();

			i += 1;
		}

		this.updateDisplayValue(this.getInitialValue());
	}

	public destroy(): void {}

	disableAllOtherElements(elementId: number): void {
		for (const selectModalElement of this.elements) {
			if (selectModalElement.id !== elementId) {
				selectModalElement.setActive(false, false);
			}
		}
	}

	deHighlightAllOtherElements(elementId: number): void {
		for (const selectModalElement of this.elements) {
			if (selectModalElement.id !== elementId) {
				selectModalElement.setHighlighted(false);
			}
		}
	}

	activateHighlighted(): void {
		for (const selectModalElement of this.elements) {
			if (selectModalElement.isHighlighted()) {
				selectModalElement.setActive(!selectModalElement.isActive());
				if (!this.allowMultiSelect) {
					this.disableAllOtherElements(selectModalElement.id);
				}
			}
		}
	}

	highlightUp(): void {
		for (const selectModalElement of this.elements) {
			if (selectModalElement.isHighlighted()) {
				this.getPreviousSelectModalElement(selectModalElement)?.setHighlighted(true);
				return;
			}
		}

		// nothing is highlighted
		this.elements.at(-1)?.setHighlighted(true);
	}

	highlightDown(): void {
		for (const selectModalElement of this.elements) {
			if (selectModalElement.isHighlighted()) {
				this.getNextSelectModalElement(selectModalElement)?.setHighlighted(true);
				return;
			}
		}

		// nothing is highlighted
		this.elements.at(0)?.setHighlighted(true);
	}

	private getNextSelectModalElement(element: SelectInputFieldElement): SelectInputFieldElement | undefined {
		let nextId = element.id + 1;
		nextId = mod(nextId, this.elements.length);

		return this.elements.filter(x => x.id === nextId).at(0);
	}

	private getPreviousSelectModalElement(element: SelectInputFieldElement): SelectInputFieldElement | undefined {
		let nextId = element.id - 1;
		nextId = mod(nextId, this.elements.length);

		return this.elements.filter(x => x.id === nextId).at(0);
	}
}

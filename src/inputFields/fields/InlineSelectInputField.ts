import { AbstractInputField } from '../AbstractInputField';
import { DropdownComponent } from 'obsidian';
import { ErrorLevel, MetaBindInternalError } from '../../utils/errors/MetaBindErrors';
import { InputFieldMDRC } from '../../renderChildren/InputFieldMDRC';
import { InputFieldArgumentType } from '../../parsers/InputFieldDeclarationParser';
import { OptionInputFieldArgument } from '../../inputFieldArguments/arguments/OptionInputFieldArgument';
import { MBExtendedLiteral, MBLiteral, parseLiteral, stringifyLiteral } from '../../utils/Utils';

type T = MBLiteral;

export class InlineSelectInputField extends AbstractInputField<T> {
	static allowBlock: boolean = false;
	selectComponent: DropdownComponent | undefined;
	options: OptionInputFieldArgument[];

	constructor(inputFieldMDRC: InputFieldMDRC) {
		super(inputFieldMDRC);

		this.options = inputFieldMDRC.getArguments(InputFieldArgumentType.OPTION) as OptionInputFieldArgument[];
	}

	getValue(): T | undefined {
		if (!this.selectComponent) {
			return undefined;
		}

		return parseLiteral(this.selectComponent.getValue());
	}

	filterValue(value: MBExtendedLiteral | undefined): T | undefined {
		if (value === undefined || typeof value === 'object') {
			return undefined;
		}

		return value;
	}

	updateDisplayValue(value: T): void {
		this.selectComponent?.setValue(stringifyLiteral(value));
	}

	getFallbackDefaultValue(): T {
		return '';
	}

	getHtmlElement(): HTMLElement {
		if (!this.selectComponent) {
			throw new MetaBindInternalError(ErrorLevel.WARNING, 'failed to get html element for input field', "container is undefined, field hasn't been rendered yet");
		}

		return this.selectComponent.selectEl;
	}

	render(container: HTMLDivElement): void {
		console.debug(`meta-bind | InlineSelectInputField >> render ${this.renderChild.uuid}`);

		const component = new DropdownComponent(container);
		for (const option of this.options) {
			component.addOption(stringifyLiteral(option.value), option.name);
		}
		component.setValue(stringifyLiteral(this.getInitialValue()));
		component.onChange(this.onValueChange);
		this.selectComponent = component;
	}

	public destroy(): void {}
}

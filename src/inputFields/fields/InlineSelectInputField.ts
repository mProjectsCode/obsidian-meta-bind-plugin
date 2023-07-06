import { AbstractInputField } from '../AbstractInputField';
import { DropdownComponent } from 'obsidian';
import { ErrorLevel, MetaBindInternalError, MetaBindValueError } from '../../utils/errors/MetaBindErrors';
import { InputFieldMDRC } from '../../renderChildren/InputFieldMDRC';
import { InputFieldArgumentType } from '../../parsers/InputFieldDeclarationParser';
import { OptionInputFieldArgument } from '../../inputFieldArguments/arguments/OptionInputFieldArgument';
import { MBLiteral, parseLiteral, stringifyLiteral } from '../../utils/Utils';

export class InlineSelectInputField extends AbstractInputField {
	static allowBlock: boolean = false;
	selectComponent: DropdownComponent | undefined;
	options: OptionInputFieldArgument[];

	constructor(inputFieldMDRC: InputFieldMDRC) {
		super(inputFieldMDRC);

		this.options = inputFieldMDRC.getArguments(InputFieldArgumentType.OPTION) as OptionInputFieldArgument[];
	}

	getValue(): MBLiteral {
		if (!this.selectComponent) {
			return undefined;
		}

		return parseLiteral(this.selectComponent.getValue());
	}

	setValue(value: MBLiteral): void {
		if (!this.selectComponent) {
			return;
		}

		if (typeof value !== 'object') {
			this.selectComponent.setValue(stringifyLiteral(value));
		} else {
			console.warn(new MetaBindValueError(ErrorLevel.WARNING, 'failed to set value', `invalid value '${value}' at inlineSelectInputField ${this.renderChild.uuid}`));
			this.selectComponent.setValue('');
		}
	}

	isEqualValue(value: any): boolean {
		return this.getValue() == value;
	}

	getDefaultValue(): any {
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
		component.setValue(this.renderChild.getInitialValue());
		component.onChange(this.onValueChange);
		this.selectComponent = component;
	}

	public destroy(): void {}
}

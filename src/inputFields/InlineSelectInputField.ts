import { AbstractInputField } from './AbstractInputField';
import { DropdownComponent } from 'obsidian';
import { ErrorLevel, MetaBindInternalError, MetaBindValueError } from '../utils/errors/MetaBindErrors';
import { InputFieldMDRC } from '../renderChildren/InputFieldMDRC';
import { InputFieldArgumentType } from '../parsers/InputFieldDeclarationParser';

export class InlineSelectInputField extends AbstractInputField {
	static allowBlock: boolean = false;
	selectComponent: DropdownComponent | undefined;
	options: string[];

	constructor(inputFieldMDRC: InputFieldMDRC) {
		super(inputFieldMDRC);

		this.options = inputFieldMDRC.getArguments(InputFieldArgumentType.OPTION).map(x => x.value) as string[];
	}

	getValue(): string | undefined {
		if (!this.selectComponent) {
			return undefined;
		}

		return this.selectComponent.getValue();
	}

	setValue(value: any): void {
		if (!this.selectComponent) {
			return;
		}

		if (value != null && typeof value == 'string') {
			this.selectComponent.setValue(value);
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
			component.addOption(option, option);
		}
		component.setValue(this.renderChild.getInitialValue());
		component.onChange(this.onValueChange);
		this.selectComponent = component;
	}

	public destroy(): void {}
}

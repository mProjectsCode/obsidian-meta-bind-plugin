import { AbstractInputField } from '../AbstractInputField';
import ProgressBarInput from './ProgressBarInput.svelte';
import { InputFieldMDRC } from '../../renderChildren/InputFieldMDRC';
import { ErrorLevel, MetaBindInternalError, MetaBindValueError } from '../../utils/errors/MetaBindErrors';
import { InputFieldArgumentType } from '../../parsers/InputFieldDeclarationParser';

export class ProgressBarInputField extends AbstractInputField {
	static allowInline: boolean = false;
	container: HTMLDivElement | undefined;
	component: ProgressBarInput | undefined;
	value: number;
	minValue: number;
	maxValue: number;
	addLabels: boolean;

	constructor(inputFieldMDRC: InputFieldMDRC) {
		super(inputFieldMDRC);

		this.minValue = inputFieldMDRC.getArgument(InputFieldArgumentType.MIN_VALUE)?.value ?? 0;
		this.maxValue = inputFieldMDRC.getArgument(InputFieldArgumentType.MAX_VALUE)?.value ?? 100;
		this.addLabels = inputFieldMDRC.getArgument(InputFieldArgumentType.ADD_LABELS)?.value ?? false;
		this.value = this.getDefaultValue();
	}

	getValue(): number | undefined {
		if (!this.component) {
			return undefined;
		}
		return this.value;
	}

	setValue(value: any): void {
		if (value != null && typeof value == 'number') {
			if (value >= this.minValue && value <= this.maxValue) {
				this.value = value;
			}
		} else {
			console.warn(new MetaBindValueError(ErrorLevel.WARNING, 'failed to set value', `invalid value '${value}' at progressBarInputField ${this.renderChild.uuid}`));
			this.value = this.getDefaultValue();
		}
		this.component?.updateValue(value);
	}

	isEqualValue(value: any): boolean {
		return this.value == value;
	}

	getDefaultValue(): any {
		return this.minValue;
	}

	getHtmlElement(): HTMLElement {
		if (!this.container) {
			throw new MetaBindInternalError(ErrorLevel.WARNING, 'failed to get html element for input field', "container is undefined, field hasn't been rendered yet");
		}

		return this.container;
	}

	render(container: HTMLDivElement): void {
		console.debug(`meta-bind | ProgressBarInputField >> render ${this.renderChild.uuid}`);

		this.container = container;

		this.value = this.renderChild.getInitialValue();

		this.component = new ProgressBarInput({
			target: container,
			props: {
				onValueChange: this.onValueChange.bind(this),
				progressBarInput: this,
				value: this.value,
			},
		});
	}

	public destroy(): void {
		this.component?.$destroy();
	}
}

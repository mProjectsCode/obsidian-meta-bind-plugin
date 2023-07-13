import { AbstractInputField } from '../../AbstractInputField';
import ProgressBarInput from './ProgressBarInput.svelte';
import { InputFieldMDRC } from '../../../renderChildren/InputFieldMDRC';
import { ErrorLevel, MetaBindInternalError } from '../../../utils/errors/MetaBindErrors';
import { InputFieldArgumentType } from '../../../parsers/InputFieldDeclarationParser';
import { clamp, MBExtendedLiteral } from '../../../utils/Utils';

type T = number;

export class ProgressBarInputField extends AbstractInputField<T> {
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
		this.value = this.getFallbackDefaultValue();
	}

	getValue(): T | undefined {
		if (!this.component) {
			return undefined;
		}
		return this.value;
	}

	filterValue(value: MBExtendedLiteral | undefined): T | undefined {
		if (typeof value === 'number') {
			return value;
		} else if (typeof value === 'string') {
			const v = Number.parseFloat(value);
			if (Number.isNaN(v)) {
				return undefined;
			} else {
				return clamp(v, this.minValue, this.maxValue);
			}
		} else {
			return undefined;
		}
	}

	updateDisplayValue(value: T): void {
		this.value = value;
		this.component?.updateValue(value);
	}

	getFallbackDefaultValue(): T {
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

		this.updateDisplayValue(this.getInitialValue());

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

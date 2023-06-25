import { AbstractInputField } from '../../AbstractInputField';
import ListInput from './ListInput.svelte';
import { InputFieldMDRC } from '../../../renderChildren/InputFieldMDRC';
import { ErrorLevel, MetaBindInternalError, MetaBindValueError } from '../../../utils/errors/MetaBindErrors';
import { doArraysContainEqualValues } from '../../../utils/Utils';

export class ListInputField extends AbstractInputField {
	static allowInline: boolean = false;
	container: HTMLDivElement | undefined;
	component: ListInput | undefined;
	value: string[];

	constructor(inputFieldMDRC: InputFieldMDRC) {
		super(inputFieldMDRC);

		this.value = this.getDefaultValue();
	}

	getValue(): string[] | undefined {
		if (!this.component) {
			return undefined;
		}
		return this.value;
	}

	setValue(value: any): void {
		if (value != null && Array.isArray(value)) {
			this.value = value;
		} else {
			console.warn(new MetaBindValueError(ErrorLevel.WARNING, 'failed to set value', `invalid value '${value}' at listInputField ${this.renderChild.uuid}`));
			this.value = this.getDefaultValue();
		}
		this.component?.updateValue(value);
	}

	isEqualValue(value: any): boolean {
		if (!Array.isArray(value)) {
			return false;
		}

		return doArraysContainEqualValues(this.getValue() ?? [], value);
	}

	getDefaultValue(): any {
		return [];
	}

	getHtmlElement(): HTMLElement {
		if (!this.container) {
			throw new MetaBindInternalError(ErrorLevel.WARNING, 'failed to get html element for input field', "container is undefined, field hasn't been rendered yet");
		}

		return this.container;
	}

	render(container: HTMLDivElement): void {
		console.debug(`meta-bind | ListInputField >> render ${this.renderChild.uuid}`);

		this.container = container;

		this.value = this.renderChild.getInitialValue();

		this.component = new ListInput({
			target: container,
			props: {
				onValueChange: this.onValueChange.bind(this),
				listInput: this,
				value: this.value,
			},
		});
	}

	public destroy(): void {
		this.component?.$destroy();
	}
}

import { AbstractInputField } from '../../AbstractInputField';
import ListInput from './ListInput.svelte';
import { InputFieldMDRC } from '../../../renderChildren/InputFieldMDRC';
import { ErrorLevel, MetaBindInternalError } from '../../../utils/errors/MetaBindErrors';
import { areArraysEqual, MBExtendedLiteral, MBLiteral, parseLiteral, stringifyLiteral } from '../../../utils/Utils';

type T = MBLiteral[];

export class ListInputField extends AbstractInputField<T> {
	static allowInline: boolean = false;
	container: HTMLDivElement | undefined;
	component: ListInput | undefined;
	value: string[];

	constructor(inputFieldMDRC: InputFieldMDRC) {
		super(inputFieldMDRC);

		this.value = this.getFallbackDefaultValue();
	}

	getValue(): T | undefined {
		if (!this.component) {
			return undefined;
		}
		return this.value.map(x => parseLiteral(x));
	}

	filterValue(value: MBExtendedLiteral | undefined): T | undefined {
		if (value == null || !Array.isArray(value)) {
			return undefined;
		}

		return value;
	}

	updateDisplayValue(value: T): void {
		this.value = value.map(x => stringifyLiteral(x));
		this.component?.updateValue(this.value);
	}

	isEqualValue(value: T | undefined): boolean {
		if (!Array.isArray(value)) {
			return false;
		}

		return areArraysEqual(this.getValue(), value);
	}

	getFallbackDefaultValue(): string[] {
		return [];
	}

	getHtmlElement(): HTMLElement {
		if (!this.container) {
			throw new MetaBindInternalError(
				ErrorLevel.WARNING,
				'failed to get html element for input field',
				"container is undefined, field hasn't been rendered yet",
			);
		}

		return this.container;
	}

	render(container: HTMLDivElement): void {
		console.debug(`meta-bind | ListInputField >> render ${this.renderChild.uuid}`);

		this.container = container;

		this.updateDisplayValue(this.getInitialValue());

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

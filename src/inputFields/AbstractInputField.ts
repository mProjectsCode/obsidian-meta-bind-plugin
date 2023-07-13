import { InputFieldMDRC } from '../renderChildren/InputFieldMDRC';
import { MBExtendedLiteral } from '../utils/Utils';
import { ComputedSignal } from '../utils/Signal';
import { InputFieldArgumentType } from '../parsers/InputFieldDeclarationParser';
import { DefaultValueInputFieldArgument } from '../inputFieldArguments/arguments/DefaultValueInputFieldArgument';

export type GetInputFieldType<T extends AbstractInputField<any>> = T extends AbstractInputField<infer R> ? R : unknown;

export abstract class AbstractInputField<T extends MBExtendedLiteral> {
	renderChild: InputFieldMDRC;
	filteredWriteSignal: ComputedSignal<MBExtendedLiteral | undefined, T>;
	onValueChange: (value: T | undefined) => void;

	constructor(inputFieldMDRC: InputFieldMDRC) {
		this.renderChild = inputFieldMDRC;

		this.onValueChange = (value: T | undefined) => {
			console.debug(`meta-bind | input field on value change`, value);
			this.renderChild.readSignal.set(value);
		};

		this.filteredWriteSignal = new ComputedSignal<MBExtendedLiteral | undefined, T>(this.renderChild.writeSignal, (value: MBExtendedLiteral | undefined) => {
			const filteredValue = this.filterValue(value);
			return filteredValue !== undefined ? filteredValue : this.getDefaultValue();
		});

		this.filteredWriteSignal.registerListener({
			callback: (value: T): void => {
				if (!this.isEqualValue(value)) {
					this.updateDisplayValue(value);
				}
			},
		});
	}

	getInitialValue(): T {
		return this.filteredWriteSignal.get();
	}

	isEqualValue(value: T | undefined): boolean {
		return this.getValue() === value;
	}

	getDefaultValue(): T {
		const defaultValueArgument = this.renderChild.getArgument(InputFieldArgumentType.DEFAULT_VALUE) as DefaultValueInputFieldArgument | undefined;
		if (!defaultValueArgument) {
			return this.getFallbackDefaultValue();
		}
		const filteredValue = this.filterValue(defaultValueArgument.value);
		return filteredValue !== undefined ? filteredValue : this.getFallbackDefaultValue();
	}

	/**
	 * Returns the current content of the input field
	 */
	abstract getValue(): T | undefined;

	/**
	 * Maps an extended literal to the value for the input field
	 *
	 * @param value
	 */
	abstract filterValue(value: MBExtendedLiteral | undefined): T | undefined;

	abstract updateDisplayValue(value: T): void;

	/**
	 * Returns the default value of this input field
	 */
	abstract getFallbackDefaultValue(): T;

	/**
	 * Returns the HTML element this input field is wrapped in
	 */
	abstract getHtmlElement(): HTMLElement;

	/**
	 * Renders the input field as a child of the container
	 *
	 * @param container
	 */
	abstract render(container: HTMLDivElement): void;

	abstract destroy(): void;
}

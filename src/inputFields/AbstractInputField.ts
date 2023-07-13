import { InputFieldMDRC } from '../renderChildren/InputFieldMDRC';
import { MBExtendedLiteral } from '../utils/Utils';
import { ComputedSignal } from '../utils/Signal';

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
			return this.filterValue(value);
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

	/**
	 * Returns the current content of the input field
	 */
	abstract getValue(): T | undefined;

	/**
	 * Maps an extended literal to the value for the input field
	 *
	 * @param value
	 */
	abstract filterValue(value: MBExtendedLiteral | undefined): T;

	abstract updateDisplayValue(value: T): void;

	/**
	 * Returns the default value of this input field
	 */
	abstract getDefaultValue(): T;

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

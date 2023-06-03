import { InputFieldMDRC } from '../renderChildren/InputFieldMDRC';

export abstract class AbstractInputField {
	static allowBlock: boolean = true;
	static allowInline: boolean = true;
	renderChild: InputFieldMDRC;
	onValueChange: (value: any) => void | Promise<void>;

	constructor(inputFieldMDRC: InputFieldMDRC) {
		this.renderChild = inputFieldMDRC;

		this.onValueChange = (value: any) => {
			console.log('input field on change', this, value);
			this.renderChild.readSignal.set(value);
		};

		this.renderChild.writeSignal.registerListener({
			callback: (value: any) => {
				if (!this.isEqualValue(value)) {
					this.setValue(value);
				}
			},
		});
	}

	/**
	 * Returns the current content of the input field
	 */
	abstract getValue(): any;

	/**
	 * Sets the value on this input field, overriding the current content
	 *
	 * @param value
	 */
	abstract setValue(value: any): void;

	/**
	 * Checks if the value is the same as the value of this input field
	 *
	 * @param value
	 */
	abstract isEqualValue(value: any): boolean;

	/**
	 * Returns the default value of this input field
	 */
	abstract getDefaultValue(): any;

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

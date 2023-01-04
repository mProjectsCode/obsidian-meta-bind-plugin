import { InputFieldMarkdownRenderChild } from '../InputFieldMarkdownRenderChild';

export abstract class AbstractInputField {
	static allowBlock: boolean = true;
	static allowInline: boolean = true;
	inputFieldMarkdownRenderChild: InputFieldMarkdownRenderChild;
	onValueChange: (value: any) => void | Promise<void>;

	constructor(inputFieldMarkdownRenderChild: InputFieldMarkdownRenderChild, onValueChange: (value: any) => void | Promise<void>) {
		this.inputFieldMarkdownRenderChild = inputFieldMarkdownRenderChild;
		this.onValueChange = onValueChange;
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

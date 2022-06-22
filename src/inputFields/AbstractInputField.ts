import {InputFieldMarkdownRenderChild} from '../InputFieldMarkdownRenderChild';

export abstract class AbstractInputField {
	static allowCodeBlock: boolean = true;
	static allowInlineCodeBlock: boolean = true;
	inputFieldMarkdownRenderChild: InputFieldMarkdownRenderChild;
	onValueChange: (value: any) => void | Promise<void>;

	constructor(inputFieldMarkdownRenderChild: InputFieldMarkdownRenderChild, onValueChange: (value: any) => void | Promise<void>) {
		this.inputFieldMarkdownRenderChild = inputFieldMarkdownRenderChild;
		this.onValueChange = onValueChange;
	}

	/**
	 * This will return the current content of the input field.
	 */
	abstract getValue(): any;

	/**
	 * This will set the value on this input field, overriding the current content.
	 *
	 * @param value
	 */
	abstract setValue(value: any): void;

	abstract isEqualValue(value: any): boolean;

	abstract getDefaultValue(): any;

	abstract getHtmlElement(): HTMLElement;

	abstract render(container: HTMLDivElement): void;
}

import { AbstractInputField } from '../AbstractInputField';
import EditorInput from './EditorInput.svelte';
import { InputFieldMarkdownRenderChild } from '../../InputFieldMarkdownRenderChild';
import { MetaBindInternalError } from '../../utils/MetaBindErrors';

export class EditorInputField extends AbstractInputField {
	static allowInlineCodeBlock: boolean = false;
	container: HTMLDivElement | undefined;
	component: EditorInput | undefined;
	value: string;

	constructor(inputFieldMarkdownRenderChild: InputFieldMarkdownRenderChild, onValueChange: (value: any) => void | Promise<void>) {
		super(inputFieldMarkdownRenderChild, onValueChange);

		this.value = '';
	}

	getValue(): string {
		return this.value;
	}

	setValue(value: any): void {
		this.value = value;
		this.component?.updateValue(value);
	}

	isEqualValue(value: any): boolean {
		return this.value == value;
	}

	getDefaultValue(): any {
		return '';
	}

	getHtmlElement(): HTMLElement {
		if (!this.container) {
			throw new MetaBindInternalError('');
		}

		return this.container;
	}

	render(container: HTMLDivElement): void {
		console.debug(`meta-bind | EditorInputField >> render ${this.inputFieldMarkdownRenderChild.uuid}`);

		this.container = container;

		this.value = this.inputFieldMarkdownRenderChild.getInitialValue();

		this.component = new EditorInput({
			target: container,
			props: {
				onValueChange: this.onValueChange.bind(this),
				editorInput: this,
				value: this.value,
			},
		});

		this.component.render();
	}

	public destroy(): void {
		this.component?.$destroy();
	}
}

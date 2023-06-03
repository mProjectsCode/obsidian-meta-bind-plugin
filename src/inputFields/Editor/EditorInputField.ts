import { AbstractInputField } from '../AbstractInputField';
import EditorInput from './EditorInput.svelte';
import { MetaBindInternalError } from '../../utils/MetaBindErrors';
import { InputFieldMDRC } from '../../renderChildren/InputFieldMDRC';

export class EditorInputField extends AbstractInputField {
	static allowInlineCodeBlock: boolean = false;
	container: HTMLDivElement | undefined;
	component: EditorInput | undefined;
	value: string;

	constructor(inputFieldMDRC: InputFieldMDRC) {
		super(inputFieldMDRC);

		this.value = '';
	}

	getValue(): string | undefined {
		if (!this.component) {
			return undefined;
		}
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
		console.debug(`meta-bind | EditorInputField >> render ${this.renderChild.uuid}`);

		this.container = container;

		this.value = this.renderChild.getInitialValue();

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

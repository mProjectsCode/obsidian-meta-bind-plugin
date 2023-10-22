import { AbstractInputField } from '../../AbstractInputField';
import EditorInput from './EditorInput.svelte';
import { ErrorLevel, MetaBindInternalError } from '../../../utils/errors/MetaBindErrors';
import { InputFieldMDRC } from '../../../renderChildren/InputFieldMDRC';
import { MBExtendedLiteral } from '../../../utils/Utils';

type T = string;

export class EditorInputField extends AbstractInputField<T> {
	static allowInline: boolean = false;
	container: HTMLDivElement | undefined;
	component: EditorInput | undefined;
	value: string;

	constructor(inputFieldMDRC: InputFieldMDRC) {
		super(inputFieldMDRC);

		this.value = this.getFallbackDefaultValue();
	}

	getValue(): T | undefined {
		if (!this.component) {
			return undefined;
		}
		return this.value;
	}

	filterValue(value: MBExtendedLiteral | undefined): T | undefined {
		if (value == null || typeof value !== 'string') {
			return undefined;
		}

		return value;
	}

	updateDisplayValue(value: T): void {
		this.value = value;
		this.component?.updateValue(value);
	}

	getFallbackDefaultValue(): T {
		return '';
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
		console.debug(`meta-bind | EditorInputField >> render ${this.renderChild.uuid}`);

		this.container = container;

		this.updateDisplayValue(this.getInitialValue());

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

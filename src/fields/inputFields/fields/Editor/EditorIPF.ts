import { AbstractInputField } from '../../AbstractInputField';
import { type SvelteComponent } from 'svelte';
import EditorComponent from './EditorComponent.svelte';
import { isLiteral } from '../../../../utils/Literal';
import { type IInputFieldBase } from '../../IInputFieldBase';

export class EditorIPF extends AbstractInputField<string, string> {
	mdUnloadCallback: (() => void) | undefined;

	constructor(renderChild: IInputFieldBase) {
		super(renderChild);
	}

	protected filterValue(value: unknown): string | undefined {
		return isLiteral(value) ? value?.toString() : undefined;
	}

	protected getFallbackDefaultValue(): string {
		return '';
	}

	protected getSvelteComponent(): typeof SvelteComponent {
		// @ts-ignore
		return EditorComponent;
	}

	protected rawReverseMapValue(value: string): string | undefined {
		return value;
	}

	protected rawMapValue(value: string): string {
		return value;
	}

	protected getMountArgs(): Record<string, unknown> {
		return {
			render: (el: HTMLElement, value: string) => void this.renderInElement(el, value),
		};
	}

	async renderInElement(el: HTMLElement, value: string): Promise<void> {
		this.mdUnloadCallback?.();
		el.innerHTML = '';
		this.mdUnloadCallback = await this.base.plugin.internal.renderMarkdown(value, el, this.base.getFilePath());
	}

	protected onunmount(): void {
		super.onunmount();
		this.mdUnloadCallback?.();
	}
}

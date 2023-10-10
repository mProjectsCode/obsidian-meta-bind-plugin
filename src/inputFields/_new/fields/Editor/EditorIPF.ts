import { NewAbstractInputField } from '../../NewAbstractInputField';
import { InputFieldMDRC } from '../../../../renderChildren/InputFieldMDRC';
import { isLiteral } from '../../../../utils/Utils';
import { SvelteComponent } from 'svelte';
import EditorComponent from './EditorComponent.svelte';
import { MarkdownRenderer } from 'obsidian';

export class EditorIPF extends NewAbstractInputField<string, string> {
	constructor(renderChild: InputFieldMDRC) {
		super(renderChild);
	}

	protected filterValue(value: any): string | undefined {
		return isLiteral(value) ? value?.toString() : undefined;
	}

	protected getFallbackDefaultValue(): string {
		return '';
	}

	protected getSvelteComponent(): typeof SvelteComponent {
		return EditorComponent;
	}

	protected rawReverseMapValue(value: string): string | undefined {
		return value;
	}

	protected rawMapValue(value: string): string {
		return value;
	}

	protected getMountArgs(): Record<string, any> {
		return {
			render: (el: HTMLElement, value: string) => this.renderInElement(el, value),
		};
	}

	renderInElement(el: HTMLElement, value: string): void {
		el.empty();
		MarkdownRenderer.render(this.renderChild.plugin.app, value, el, this.renderChild.filePath, this.renderChild);
	}
}

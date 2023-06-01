import { MarkdownRenderChild } from 'obsidian';
import { EditorView, WidgetType } from '@codemirror/view';
import MetaBindPlugin from '../main';
import { ViewFieldMarkdownRenderChild } from '../ViewFieldMarkdownRenderChild';
import { InputFieldMarkdownRenderChild, RenderChildType } from '../InputFieldMarkdownRenderChild';

export abstract class MarkdownRenderChildWidget<T extends MarkdownRenderChild> extends WidgetType {
	content: string;
	filePath: string;
	plugin: MetaBindPlugin;
	renderChild?: T;

	constructor(content: string, filePath: string, plugin: MetaBindPlugin) {
		super();
		this.content = content;
		this.filePath = filePath;
		this.plugin = plugin;
	}

	eq(other: ViewFieldWidget): boolean {
		return other.content === this.content;
	}

	abstract createRenderChild(container: HTMLElement): T;

	public toDOM(view: EditorView): HTMLElement {
		const div = document.createElement('code');

		this.renderChild = this.createRenderChild(div);
		this.renderChild.load();

		return div;
	}

	public destroy(dom: HTMLElement): void {
		this.renderChild?.unload();
		super.destroy(dom);
	}
}

export class ViewFieldWidget extends MarkdownRenderChildWidget<ViewFieldMarkdownRenderChild> {
	public createRenderChild(container: HTMLElement): ViewFieldMarkdownRenderChild {
		return this.plugin.api.createViewFieldFromString(this.content, RenderChildType.INLINE, this.filePath, container);
	}
}

export class InputFieldWidget extends MarkdownRenderChildWidget<InputFieldMarkdownRenderChild> {
	public createRenderChild(container: HTMLElement): InputFieldMarkdownRenderChild {
		return this.plugin.api.createInputFieldFromString(this.content, RenderChildType.INLINE, this.filePath, container);
	}
}

export enum MBWidgetType {
	INPUT_FIELD_WIDGET = 'INPUT_FIELD_WIDGET',
	VIEW_FIELD_WIDGET = 'VIEW_FIELD_WIDGET',
}

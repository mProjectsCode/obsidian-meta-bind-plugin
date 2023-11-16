import { type EditorView, WidgetType } from '@codemirror/view';
import type MetaBindPlugin from '../main';
import { type AbstractMDRC } from '../renderChildren/AbstractMDRC';
import { type ViewFieldMDRC } from '../renderChildren/ViewFieldMDRC';
import { type InputFieldMDRC, RenderChildType } from '../renderChildren/InputFieldMDRC';
import { type Component } from 'obsidian';
import { type ExcludedMDRC } from '../renderChildren/ExcludedMDRC';

export abstract class MarkdownRenderChildWidget<T extends AbstractMDRC> extends WidgetType {
	content: string;
	filePath: string;
	parentComponent: Component;
	plugin: MetaBindPlugin;
	renderChild?: T | ExcludedMDRC;

	constructor(content: string, filePath: string, component: Component, plugin: MetaBindPlugin) {
		super();
		this.content = content;
		this.filePath = filePath;
		this.parentComponent = component;
		this.plugin = plugin;
	}

	eq(other: ViewFieldWidget): boolean {
		return other.content === this.content;
	}

	abstract createRenderChild(container: HTMLElement, component: Component): T | ExcludedMDRC;

	public toDOM(_: EditorView): HTMLElement {
		const span = document.createElement('span');
		span.addClass('cm-inline-code');

		this.renderChild = this.createRenderChild(span, this.parentComponent);

		return span;
	}

	public destroy(dom: HTMLElement): void {
		this.renderChild?.unload();
		super.destroy(dom);
	}
}

export class ViewFieldWidget extends MarkdownRenderChildWidget<ViewFieldMDRC> {
	public createRenderChild(container: HTMLElement, component: Component): ViewFieldMDRC | ExcludedMDRC {
		return this.plugin.api.createViewFieldFromString(
			this.content,
			RenderChildType.INLINE,
			this.filePath,
			container,
			component,
		);
	}
}

export class InputFieldWidget extends MarkdownRenderChildWidget<InputFieldMDRC> {
	public createRenderChild(container: HTMLElement, component: Component): InputFieldMDRC | ExcludedMDRC {
		return this.plugin.api.createInputFieldFromString(
			this.content,
			RenderChildType.INLINE,
			this.filePath,
			container,
			component,
		);
	}
}

export enum MBWidgetType {
	INPUT_FIELD_WIDGET = 'INPUT_FIELD_WIDGET',
	VIEW_FIELD_WIDGET = 'VIEW_FIELD_WIDGET',
}

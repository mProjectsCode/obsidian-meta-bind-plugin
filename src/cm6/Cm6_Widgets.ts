import { EditorView, WidgetType } from '@codemirror/view';
import MetaBindPlugin from '../main';
import { AbstractMDRC } from '../renderChildren/AbstractMDRC';
import { ViewFieldMDRC } from '../renderChildren/ViewFieldMDRC';
import { InputFieldMDRC, RenderChildType } from '../renderChildren/InputFieldMDRC';
import { Component } from 'obsidian';

export abstract class MarkdownRenderChildWidget<T extends AbstractMDRC> extends WidgetType {
	content: string;
	filePath: string;
	parentComponent: Component;
	plugin: MetaBindPlugin;
	renderChild?: T;

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

	abstract createRenderChild(container: HTMLElement): T;

	public toDOM(view: EditorView): HTMLElement {
		const div = document.createElement('span');
		div.addClass('cm-inline-code');

		this.renderChild = this.createRenderChild(div);
		this.renderChild.load();

		this.parentComponent.addChild(this.renderChild);

		return div;
	}

	public destroy(dom: HTMLElement): void {
		this.renderChild?.unload();
		super.destroy(dom);
	}
}

export class ViewFieldWidget extends MarkdownRenderChildWidget<ViewFieldMDRC> {
	public createRenderChild(container: HTMLElement): ViewFieldMDRC {
		return this.plugin.api.createViewFieldFromString(this.content, RenderChildType.INLINE, this.filePath, container);
	}
}

export class InputFieldWidget extends MarkdownRenderChildWidget<InputFieldMDRC> {
	public createRenderChild(container: HTMLElement): InputFieldMDRC {
		return this.plugin.api.createInputFieldFromString(this.content, RenderChildType.INLINE, this.filePath, container);
	}
}

export enum MBWidgetType {
	INPUT_FIELD_WIDGET = 'INPUT_FIELD_WIDGET',
	VIEW_FIELD_WIDGET = 'VIEW_FIELD_WIDGET',
}

import { type EditorView, WidgetType } from '@codemirror/view';
import { type Component } from 'obsidian';
import { type FieldType } from 'packages/core/src/api/API';
import type MetaBindPlugin from 'packages/obsidian/src/main';
import { type ExcludedMDRC } from 'packages/obsidian/src/renderChildren/ExcludedMDRC';
import { type FieldMDRC } from 'packages/obsidian/src/renderChildren/FieldMDRC';

export class MarkdownRenderChildWidget extends WidgetType {
	type: FieldType;
	content: string;
	filePath: string;
	parentComponent: Component;
	plugin: MetaBindPlugin;
	renderChild?: FieldMDRC | ExcludedMDRC;

	constructor(type: FieldType, content: string, filePath: string, component: Component, plugin: MetaBindPlugin) {
		super();
		this.type = type;
		this.content = content;
		this.filePath = filePath;
		this.parentComponent = component;
		this.plugin = plugin;
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	eq(other: MarkdownRenderChildWidget): boolean {
		return other.content === this.content;
	}

	public toDOM(_: EditorView): HTMLElement {
		const span = document.createElement('span');
		span.addClass('cm-inline-code');

		this.renderChild = this.plugin.api.createInlineMDRCFromString(
			this.content,
			undefined,
			this.filePath,
			span,
			this.parentComponent,
		);

		return span;
	}

	public destroy(dom: HTMLElement): void {
		this.renderChild?.unload();
		super.destroy(dom);
	}
}

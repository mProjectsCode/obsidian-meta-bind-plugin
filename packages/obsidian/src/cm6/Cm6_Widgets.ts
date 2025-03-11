import type { EditorView } from '@codemirror/view';
import { WidgetType } from '@codemirror/view';
import type { Component } from 'obsidian';
import type { InlineFieldType } from 'packages/core/src/config/APIConfigs';
import type { ObsMetaBind } from 'packages/obsidian/src/main';
import type { MountableMDRC } from 'packages/obsidian/src/MountableMDRC';

export class MarkdownRenderChildWidget extends WidgetType {
	mb: ObsMetaBind;
	type: InlineFieldType;
	content: string;
	filePath: string;
	parentComponent: Component;
	renderChild?: MountableMDRC;

	constructor(type: InlineFieldType, content: string, filePath: string, component: Component, mb: ObsMetaBind) {
		super();
		this.type = type;
		this.content = content;
		this.filePath = filePath;
		this.parentComponent = component;
		this.mb = mb;
	}

	eq(other: MarkdownRenderChildWidget): boolean {
		return other.content === this.content;
	}

	public toDOM(_: EditorView): HTMLElement {
		const span = document.createElement('span');
		span.addClass('cm-inline-code');

		const mountable = this.mb.api.createInlineFieldOfTypeFromString(
			this.type,
			this.content,
			this.filePath,
			undefined,
		);

		this.renderChild = this.mb.api.wrapInMDRC(mountable, span, this.parentComponent);

		return span;
	}

	public destroy(dom: HTMLElement): void {
		this.renderChild?.unload();
		super.destroy(dom);
	}
}

import type { MarkdownPostProcessorContext } from 'obsidian';
import type { LinePosition } from 'packages/core/src/config/APIConfigs';
import { NotePosition } from 'packages/core/src/config/APIConfigs';

export class ObsNotePosition extends NotePosition {
	ctx: MarkdownPostProcessorContext;
	element: HTMLElement;

	constructor(ctx: MarkdownPostProcessorContext, element: HTMLElement) {
		super(undefined);

		this.ctx = ctx;
		this.element = element;
	}

	public getPosition(): LinePosition | undefined {
		const pos = this.ctx.getSectionInfo(this.element);

		if (!pos) {
			return undefined;
		}

		return {
			lineStart: pos.lineStart,
			lineEnd: pos.lineEnd,
		};
	}
}

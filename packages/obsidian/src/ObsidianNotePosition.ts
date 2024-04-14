import { type MarkdownPostProcessorContext } from 'obsidian';
import { type LinePosition, NotePosition } from 'packages/core/src/config/APIConfigs';

export class ObsidianNotePosition extends NotePosition {
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

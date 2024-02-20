import { MarkdownRenderer } from 'obsidian';
import { MDLinkParser } from 'packages/core/src/parsers/MarkdownLinkParser';
import { getUUID, showUnloadedMessage } from 'packages/core/src/utils/Utils';
import { ErrorLevel, MetaBindEmbedError } from 'packages/core/src/utils/errors/MetaBindErrors';
import type MetaBindPlugin from 'packages/obsidian/src/main.ts';
import { AbstractMDRC } from 'packages/obsidian/src/renderChildren/AbstractMDRC';

export const EMBED_MAX_DEPTH = 8;

export class EmbedMDRC extends AbstractMDRC {
	content: string;
	depth: number;
	uuid: string;

	constructor(plugin: MetaBindPlugin, filePath: string, containerEl: HTMLElement, content: string, depth: number) {
		super(plugin, filePath, containerEl);

		this.content = content;
		this.depth = depth;

		this.uuid = getUUID();
	}

	async parseContent(): Promise<string> {
		const lines = this.content
			.split('\n')
			.map(line => line.trim())
			.filter(line => line.length > 0);
		if (lines.length === 0) {
			return '';
		}
		if (lines.length > 1) {
			throw new MetaBindEmbedError({
				errorLevel: ErrorLevel.ERROR,
				effect: 'can not create embed',
				cause: 'embed may only contain one link',
			});
		}
		const firstLine = lines[0];
		const link = MDLinkParser.parseLink(firstLine);
		if (!link.internal) {
			throw new MetaBindEmbedError({
				errorLevel: ErrorLevel.ERROR,
				effect: 'can not create embed',
				cause: 'embed link is not an internal link',
			});
		}
		const file = this.plugin.app.metadataCache.getFirstLinkpathDest(link.target, this.filePath);
		if (file === null) {
			throw new MetaBindEmbedError({
				errorLevel: ErrorLevel.ERROR,
				effect: 'can not create embed',
				cause: 'link target not found',
			});
		}

		const fileContent = await this.plugin.app.vault.cachedRead(file);
		return fileContent.replace(/(```+|~~~+)meta-bind-embed.*/g, `$1meta-bind-embed-internal-${this.depth + 1}`);
	}

	public async onload(): Promise<void> {
		console.debug('meta-bind | EmbedMDRC >> unload', this);

		if (this.depth >= EMBED_MAX_DEPTH) {
			this.containerEl.empty();
			this.containerEl.addClass('mb-error');
			this.containerEl.innerText = 'Max embed depth reached';
		} else {
			const fileContent = await this.parseContent();

			await MarkdownRenderer.render(this.plugin.app, fileContent, this.containerEl, this.filePath, this);
		}

		super.onload();
	}

	public onunload(): void {
		console.debug('meta-bind | EmbedMDRC >> unload', this);

		showUnloadedMessage(this.containerEl, 'embed');

		super.onunload();
	}
}

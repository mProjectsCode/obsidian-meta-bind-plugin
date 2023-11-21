import { AbstractMDRC } from './AbstractMDRC';
import type MetaBindPlugin from '../main';
import { RenderChildType } from './InputFieldMDRC';
import { MarkdownRenderer } from 'obsidian';
import { parseMdLink } from '../parsers/MarkdownLinkParser';
import { ErrorLevel, MetaBindEmbedError } from '../utils/errors/MetaBindErrors';

export const EMBED_MAX_DEPTH = 8;

export class EmbedMDRC extends AbstractMDRC {
	content: string;
	depth: number;

	constructor(
		containerEl: HTMLElement,
		content: string,
		plugin: MetaBindPlugin,
		filePath: string,
		uuid: string,
		depth: number,
	) {
		super(containerEl, RenderChildType.BLOCK, plugin, filePath, uuid);

		this.content = content;
		this.depth = depth;
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
		const link = parseMdLink(firstLine);
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
		const fileContentLines = fileContent.split('\n');
		for (let i = 0; i < fileContentLines.length; i++) {
			const line = fileContentLines[i];
			if (line.startsWith('```meta-bind-embed')) {
				fileContentLines[i] = `\`\`\`meta-bind-embed-internal-${this.depth + 1}`;
			}
		}
		return fileContentLines.join('\n');
	}

	public async onload(): Promise<void> {
		if (this.depth >= EMBED_MAX_DEPTH) {
			this.containerEl.empty();
			this.containerEl.addClass('mb-error');
			this.containerEl.innerText = 'Max embed depth reached';
		} else {
			const fileContent = await this.parseContent();

			await MarkdownRenderer.render(this.plugin.app, fileContent, this.containerEl, this.filePath, this);
		}
	}
}

import { FieldBase } from 'packages/core/src/fields/FieldBase';
import { type IPlugin } from 'packages/core/src/IPlugin';
import { ErrorLevel, MetaBindEmbedError } from 'packages/core/src/utils/errors/MetaBindErrors';
import { MDLinkParser } from 'packages/core/src/parsers/MarkdownLinkParser';
import { ErrorCollection } from 'packages/core/src/utils/errors/ErrorCollection';
import { showUnloadedMessage } from 'packages/core/src/utils/Utils';
import { EMBED_MAX_DEPTH } from 'packages/core/src/config/FieldConfigs';

export class EmbedBase extends FieldBase {
	depth: number;
	content: string;
	markdownUnloadCallback: (() => void) | undefined;

	constructor(plugin: IPlugin, uuid: string, filePath: string, depth: number, content: string) {
		super(plugin, uuid, filePath);

		this.depth = depth;
		this.content = content;
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
		const filePath = this.plugin.internal.getFilePathByName(link.target, this.getFilePath());
		if (filePath === undefined) {
			throw new MetaBindEmbedError({
				errorLevel: ErrorLevel.ERROR,
				effect: 'can not create embed',
				cause: 'link target not found',
			});
		}
		return await this.plugin.internal.readFilePath(filePath);
	}

	checkMaxDepth(): void {
		if (this.depth > EMBED_MAX_DEPTH) {
			throw new MetaBindEmbedError({
				errorLevel: ErrorLevel.ERROR,
				effect: 'can not create embed',
				cause: 'embed depth exceeds maximum',
			});
		}
	}

	async renderContent(target: HTMLElement): Promise<void> {
		try {
			this.checkMaxDepth();

			const content = await this.parseContent();
			const renderContent = content.replace(
				/(```+|~~~+)meta-bind-embed.*/g,
				`$1meta-bind-embed-internal-${this.depth + 1}`,
			);

			this.markdownUnloadCallback = await this.plugin.internal.renderMarkdown(
				renderContent,
				target,
				this.getFilePath(),
			);
		} catch (e) {
			const errorCollection = new ErrorCollection('Embed');
			errorCollection.add(e);

			this.plugin.internal.createErrorIndicator(target, {
				errorCollection: errorCollection,
			});
		}
	}

	protected onMount(targetEl: HTMLElement): void {
		console.log('meta-bind | EmbedBase >> mount', this.content);

		void this.renderContent(targetEl);
	}

	protected onUnmount(targetEl: HTMLElement): void {
		console.log('meta-bind | EmbedBase >> unmount', this.content);

		this.markdownUnloadCallback?.();

		showUnloadedMessage(targetEl, 'Embed');
	}
}

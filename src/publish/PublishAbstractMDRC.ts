import { MarkdownRenderChild } from 'obsidian/publish';
import { getUUID } from '../utils/Utils';
import { type MetaBindPublishPlugin } from './Publish';

export class PublishAbstractMDRC extends MarkdownRenderChild {
	readonly plugin: MetaBindPublishPlugin;
	readonly uuid: string;
	readonly filePath: string;

	constructor(plugin: MetaBindPublishPlugin, filePath: string, containerEl: HTMLElement) {
		super(containerEl);

		this.plugin = plugin;
		this.filePath = filePath;
		this.uuid = getUUID();
	}

	onload(): void {
		super.onload();
	}

	public onunload(): void {
		super.onunload();
	}
}

import { MarkdownRenderChild } from 'obsidian';
import type MetaBindPlugin from '../main';
import { getUUID } from '../utils/Utils';

export class AbstractMDRC extends MarkdownRenderChild {
	readonly plugin: MetaBindPlugin;
	readonly uuid: string;
	readonly filePath: string;

	constructor(plugin: MetaBindPlugin, filePath: string, containerEl: HTMLElement) {
		super(containerEl);

		this.plugin = plugin;
		this.filePath = filePath;
		this.uuid = getUUID();
	}

	onload(): void {
		this.plugin.mdrcManager.registerMDRC(this);

		super.onload();
	}

	public onunload(): void {
		this.plugin.mdrcManager.unregisterMDRC(this);

		super.onunload();
	}
}

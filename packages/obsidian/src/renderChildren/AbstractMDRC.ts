import { MarkdownRenderChild } from 'obsidian';
import { getUUID } from 'packages/core/src/utils/Utils';
import type MetaBindPlugin from 'packages/obsidian/src/main.ts';

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

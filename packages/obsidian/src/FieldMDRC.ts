import { type FieldBase } from 'packages/core/src/fields/FieldBase';
import type MetaBindPlugin from 'packages/obsidian/src/main.ts';
import { getUUID } from 'packages/core/src/utils/Utils';
import { MarkdownRenderChild } from 'obsidian';

export class FieldMDRC extends MarkdownRenderChild {
	readonly plugin: MetaBindPlugin;

	readonly base: FieldBase;
	readonly uuid: string;
	readonly filePath: string;

	constructor(plugin: MetaBindPlugin, base: FieldBase, containerEl: HTMLElement) {
		super(containerEl);

		this.plugin = plugin;
		this.base = base;

		this.uuid = getUUID();
		this.filePath = base.getFilePath();

		this.base.registerUnmountCb(() => {
			this.unload();
		});
	}

	onload(): void {
		this.plugin.mdrcManager.registerMDRC(this);
		this.base.mount(this.containerEl);

		super.onload();
	}

	onunload(): void {
		this.plugin.mdrcManager.unregisterMDRC(this);
		this.base.unmount();

		super.onunload();
	}
}

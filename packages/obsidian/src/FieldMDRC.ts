import type MetaBindPlugin from 'packages/obsidian/src/main.ts';
import { getUUID } from 'packages/core/src/utils/Utils';
import { MarkdownRenderChild } from 'obsidian';
import { type FieldMountable } from 'packages/core/src/fields/FieldMountable';

export class FieldMDRC extends MarkdownRenderChild {
	readonly plugin: MetaBindPlugin;

	readonly mountable: FieldMountable;
	readonly uuid: string;
	readonly filePath: string;

	constructor(plugin: MetaBindPlugin, mountable: FieldMountable, containerEl: HTMLElement) {
		super(containerEl);

		this.plugin = plugin;
		this.mountable = mountable;

		this.uuid = getUUID();
		this.filePath = mountable.getFilePath();

		this.mountable.registerUnmountCb(() => {
			this.unload();
		});
	}

	onload(): void {
		this.plugin.mdrcManager.registerMDRC(this);
		this.mountable.mount(this.containerEl);

		super.onload();
	}

	onunload(): void {
		this.plugin.mdrcManager.unregisterMDRC(this);
		this.mountable.unmount();

		super.onunload();
	}
}

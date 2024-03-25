import { type FieldMountable } from 'packages/core/src/fields/FieldMountable';
import { type MetaBindPublishPlugin } from 'packages/publish/src/main';
import { getUUID } from 'packages/core/src/utils/Utils';
import { MarkdownRenderChild } from 'obsidian/publish';

export class PublishFieldMDRC extends MarkdownRenderChild {
	readonly plugin: MetaBindPublishPlugin;
	readonly mountable: FieldMountable;
	readonly uuid: string;
	readonly filePath: string;

	constructor(plugin: MetaBindPublishPlugin, mountable: FieldMountable, containerEl: HTMLElement) {
		super(containerEl);

		this.plugin = plugin;
		this.mountable = mountable;

		this.uuid = getUUID();
		this.filePath = mountable.getFilePath();
	}

	onload(): void {
		this.mountable.mount(this.containerEl);

		super.onload();
	}

	onunload(): void {
		this.mountable.unmount();

		super.onunload();
	}
}

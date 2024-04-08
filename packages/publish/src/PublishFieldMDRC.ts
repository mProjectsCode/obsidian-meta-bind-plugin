import { type MetaBindPublishPlugin } from 'packages/publish/src/main';
import { MarkdownRenderChild } from 'obsidian/publish';
import { type Mountable } from 'packages/core/src/utils/Mountable';

export class PublishFieldMDRC extends MarkdownRenderChild {
	readonly plugin: MetaBindPublishPlugin;
	readonly mountable: Mountable;

	constructor(plugin: MetaBindPublishPlugin, mountable: Mountable, containerEl: HTMLElement) {
		super(containerEl);

		this.plugin = plugin;
		this.mountable = mountable;

		this.mountable.registerUnmountCb(() => {
			this.unload();
		});
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

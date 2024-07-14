import { MarkdownRenderChild } from 'obsidian';
import type { Mountable } from 'packages/core/src/utils/Mountable';
import type MetaBindPlugin from 'packages/obsidian/src/main.ts';

export class MountableMDRC extends MarkdownRenderChild {
	readonly plugin: MetaBindPlugin;
	readonly mountable: Mountable;

	constructor(plugin: MetaBindPlugin, mountable: Mountable, containerEl: HTMLElement) {
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
		// prevent double unmounting in some cases
		if (this.mountable.isMounted()) {
			this.mountable.unmount();
		}

		super.onunload();
	}
}

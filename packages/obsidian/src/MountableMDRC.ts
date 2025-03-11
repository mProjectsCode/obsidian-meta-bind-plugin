import { MarkdownRenderChild } from 'obsidian';
import type { Mountable } from 'packages/core/src/utils/Mountable';
import type { ObsMetaBind } from 'packages/obsidian/src/main.ts';

export class MountableMDRC extends MarkdownRenderChild {
	readonly mb: ObsMetaBind;
	readonly mountable: Mountable;

	constructor(mb: ObsMetaBind, mountable: Mountable, containerEl: HTMLElement) {
		super(containerEl);

		this.mb = mb;
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

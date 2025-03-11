import { MarkdownRenderChild } from 'obsidian/publish';
import type { Mountable } from 'packages/core/src/utils/Mountable';
import type { PublishMetaBind } from 'packages/publish/src/main';

export class PublishFieldMDRC extends MarkdownRenderChild {
	readonly mb: PublishMetaBind;
	readonly mountable: Mountable;

	constructor(mb: PublishMetaBind, mountable: Mountable, containerEl: HTMLElement) {
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
		this.mountable.unmount();

		super.onunload();
	}
}

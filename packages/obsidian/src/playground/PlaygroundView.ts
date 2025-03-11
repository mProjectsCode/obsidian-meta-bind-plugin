import type { WorkspaceLeaf } from 'obsidian';
import { ItemView } from 'obsidian';
import PlaygroundComponent from 'packages/core/src/utils/playground/PlaygroundComponent.svelte';
import type { ObsMetaBind } from 'packages/obsidian/src/main';
import type { Component as SvelteComponent } from 'svelte';
import { mount, unmount } from 'svelte';

export const MB_PLAYGROUND_VIEW_TYPE = 'mb-playground-view-type';

export class PlaygroundView extends ItemView {
	component: ReturnType<SvelteComponent> | undefined;
	mb: ObsMetaBind;

	constructor(leaf: WorkspaceLeaf, mb: ObsMetaBind) {
		super(leaf);
		this.mb = mb;
	}

	getViewType(): string {
		return MB_PLAYGROUND_VIEW_TYPE;
	}

	getDisplayText(): string {
		return 'Meta Bind playground';
	}

	async onOpen(): Promise<void> {
		this.contentEl.empty();

		this.component = mount(PlaygroundComponent, {
			target: this.contentEl,
			props: {
				mb: this.mb,
			},
		});
	}

	async onClose(): Promise<void> {
		if (this.component) {
			void unmount(this.component);
		}
	}
}

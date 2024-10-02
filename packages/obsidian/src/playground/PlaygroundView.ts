import type { WorkspaceLeaf } from 'obsidian';
import { ItemView } from 'obsidian';
import PlaygroundComponent from 'packages/core/src/utils/playground/PlaygroundComponent.svelte';
import type MetaBindPlugin from 'packages/obsidian/src/main';
import type { Component as SvelteComponent } from 'svelte';
import { mount, unmount } from 'svelte';

export const MB_PLAYGROUND_VIEW_TYPE = 'mb-playground-view-type';

export class PlaygroundView extends ItemView {
	component: ReturnType<SvelteComponent> | undefined;
	plugin: MetaBindPlugin;

	constructor(leaf: WorkspaceLeaf, plugin: MetaBindPlugin) {
		super(leaf);
		this.plugin = plugin;
	}

	getViewType(): string {
		return MB_PLAYGROUND_VIEW_TYPE;
	}

	getDisplayText(): string {
		return 'Meta Bind playground';
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	async onOpen(): Promise<void> {
		this.contentEl.empty();

		this.component = mount(PlaygroundComponent, {
			target: this.contentEl,
			props: {
				plugin: this.plugin,
			},
		});
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	async onClose(): Promise<void> {
		if (this.component) {
			unmount(this.component);
		}
	}
}

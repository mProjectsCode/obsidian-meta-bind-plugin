import { ItemView, type WorkspaceLeaf } from 'obsidian';
import FaqComponent from 'packages/core/src/utils/faq/FaqComponent.svelte';
import type MetaBindPlugin from 'packages/obsidian/src/main';

export const MB_FAQ_VIEW_TYPE = 'mb-faq-view-type';

export class FaqView extends ItemView {
	component: FaqComponent | undefined;
	plugin: MetaBindPlugin;

	constructor(leaf: WorkspaceLeaf, plugin: MetaBindPlugin) {
		super(leaf);
		this.plugin = plugin;
	}

	getViewType(): string {
		return MB_FAQ_VIEW_TYPE;
	}

	getDisplayText(): string {
		return 'Meta Bind FAQ';
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	async onOpen(): Promise<void> {
		this.contentEl.empty();

		this.component = new FaqComponent({
			target: this.contentEl,
			props: {
				plugin: this.plugin,
			},
		});
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	async onClose(): Promise<void> {
		this.component?.$destroy();
	}
}

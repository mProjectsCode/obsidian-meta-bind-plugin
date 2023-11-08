import { ItemView, type WorkspaceLeaf } from 'obsidian';
import FaqComponent from './FaqComponent.svelte';

export const MB_FAQ_VIEW_TYPE = 'mb-faq-view-type';

export class FaqView extends ItemView {
	component: FaqComponent | undefined;

	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
	}

	getViewType(): string {
		return MB_FAQ_VIEW_TYPE;
	}

	getDisplayText(): string {
		return 'Meta Bind FAQ';
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	async onOpen(): Promise<void> {
		const container = this.containerEl.children[1];
		container.empty();

		this.component = new FaqComponent({
			target: container,
			props: {
				app: this.app,
			},
		});
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	async onClose(): Promise<void> {
		this.component?.$destroy();
	}
}

import { App, Modal } from 'obsidian';
import ImageSuggestModalComponent from './ImageSuggestModalComponent.svelte';

export class ImageSuggestModal extends Modal {
	options: string[];
	onSelect: (item: string) => void;

	constructor(app: App, options: string[], onSelect: (item: string) => void) {
		super(app);
		this.options = options;
		this.onSelect = onSelect;
	}

	public onOpen(): void {
		this.modalEl.style.width = '100%';

		new ImageSuggestModalComponent({
			target: this.contentEl,
			props: {
				options: this.options,
				onSelect: (item: string): void => {
					this.onSelect(item);
					this.close();
				},
			},
		});
	}
}

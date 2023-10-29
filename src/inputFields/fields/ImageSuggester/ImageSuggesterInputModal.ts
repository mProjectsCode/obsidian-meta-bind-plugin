import { type App, Modal } from 'obsidian';
import { type SuggesterOption } from '../Suggester/SuggesterHelper';
import ImageSuggestModalComponent from './ImageSuggestModalComponent.svelte';

export class ImageSuggesterInputModal extends Modal {
	options: SuggesterOption<string>[];
	onSelect: (item: string) => void;

	constructor(app: App, options: SuggesterOption<string>[], onSelect: (item: string) => void) {
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

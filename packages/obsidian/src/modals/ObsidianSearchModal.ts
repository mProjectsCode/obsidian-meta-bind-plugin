import type { FuzzyMatch } from 'obsidian';
import { FuzzySuggestModal, renderResults } from 'obsidian';
import type { IModal } from 'packages/core/src/modals/IModal';
import type { SelectModalContent } from 'packages/core/src/modals/SelectModalContent';
import type MetaBindPlugin from 'packages/obsidian/src/main';

export class ObsidianSearchModal<T> extends FuzzySuggestModal<T> implements IModal {
	private content: SelectModalContent<T>;

	constructor(plugin: MetaBindPlugin, content: SelectModalContent<T>) {
		super(plugin.app);

		this.content = content;
	}

	renderSuggestion(item: FuzzyMatch<T>, el: HTMLElement): void {
		renderResults(el.createDiv(), this.content.getItemText(item.item), item.match);

		const description = this.content.getItemDescription(item.item);
		if (description) {
			renderResults(el.createEl('small', { cls: 'mb-search-modal-element-description' }), description, {
				score: 0,
				matches: [],
			});
		}
	}

	getItems(): T[] {
		return this.content.getItems();
	}

	getItemText(item: T): string {
		return this.content.getItemText(item);
	}

	onChooseItem(item: T, _evt: MouseEvent | KeyboardEvent): void {
		this.content.onSelected(item);
	}
}

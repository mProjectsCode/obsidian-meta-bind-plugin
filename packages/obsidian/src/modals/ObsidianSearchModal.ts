import { FuzzySuggestModal } from 'obsidian';
import type { IModal } from 'packages/core/src/modals/IModal';
import type { SelectModalContent } from 'packages/core/src/modals/SelectModalContent';
import type MetaBindPlugin from 'packages/obsidian/src/main';

export class ObsidianSearchModal<T> extends FuzzySuggestModal<T> implements IModal {
	private content: SelectModalContent<T>;

	constructor(plugin: MetaBindPlugin, content: SelectModalContent<T>) {
		super(plugin.app);

		this.content = content;
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

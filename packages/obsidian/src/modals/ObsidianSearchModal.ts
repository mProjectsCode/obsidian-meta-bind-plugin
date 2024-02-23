import { FuzzySuggestModal } from 'obsidian';
import type MetaBindPlugin from 'packages/obsidian/src/main';
import { type SelectModalContent } from 'packages/core/src/modals/SelectModalContent';
import { type IModal } from 'packages/core/src/modals/IModal';

export class ObsidianSearchModal<T> extends FuzzySuggestModal<T> implements IModal {
	private modal: SelectModalContent<T>;

	constructor(plugin: MetaBindPlugin, modal: SelectModalContent<T>) {
		super(plugin.app);

		this.modal = modal;
	}

	getItems(): T[] {
		return this.modal.getItems();
	}

	getItemText(item: T): string {
		return this.modal.getItemText(item);
	}

	onChooseItem(item: T, _evt: MouseEvent | KeyboardEvent): void {
		this.modal.onSelected(item);
	}
}

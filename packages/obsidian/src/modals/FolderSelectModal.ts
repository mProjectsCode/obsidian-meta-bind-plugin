import { FuzzySuggestModal, TFolder } from 'obsidian';
import type MetaBindPlugin from 'packages/obsidian/src/main';

export class FolderSelectModal extends FuzzySuggestModal<TFolder> {
	plugin: MetaBindPlugin;
	selectCallback: (selected: TFolder) => void;

	constructor(plugin: MetaBindPlugin, selectCallback: (selected: TFolder) => void) {
		super(plugin.app);

		this.plugin = plugin;
		this.selectCallback = selectCallback;
	}

	getItems(): TFolder[] {
		return this.app.vault.getAllLoadedFiles().filter(file => file instanceof TFolder) as TFolder[];
	}

	getItemText(item: TFolder): string {
		return item.path;
	}

	onChooseItem(item: TFolder, _evt: MouseEvent | KeyboardEvent): void {
		this.selectCallback(item);
	}
}

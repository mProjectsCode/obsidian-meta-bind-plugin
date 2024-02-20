import { FuzzySuggestModal, TFile } from 'obsidian';
import type MetaBindPlugin from 'packages/obsidian/src/main';

export class FileSelectModal extends FuzzySuggestModal<TFile> {
	plugin: MetaBindPlugin;
	selectCallback: (selected: TFile) => void;

	constructor(plugin: MetaBindPlugin, selectCallback: (selected: TFile) => void) {
		super(plugin.app);

		this.plugin = plugin;
		this.selectCallback = selectCallback;
	}

	getItems(): TFile[] {
		return this.app.vault.getAllLoadedFiles().filter(file => file instanceof TFile) as TFile[];
	}

	getItemText(item: TFile): string {
		return item.path;
	}

	onChooseItem(item: TFile, _evt: MouseEvent | KeyboardEvent): void {
		this.selectCallback(item);
	}
}

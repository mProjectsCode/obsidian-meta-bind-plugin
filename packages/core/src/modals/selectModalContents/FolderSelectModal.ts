import { SelectModalContent } from 'packages/core/src/modals/SelectModalContent';

export class FolderSelectModal extends SelectModalContent<string> {
	public getItemText(item: string): string {
		return item;
	}

	public getItems(): string[] {
		return this.plugin.internal.file.getAllFolders();
	}
}

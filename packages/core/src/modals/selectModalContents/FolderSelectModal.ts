import { SelectModalContent } from 'packages/core/src/modals/SelectModalContent';

export class FolderSelectModal extends SelectModalContent<string> {
	public getItemText(item: string): string {
		return item;
	}

	public getItemDescription(_: string): string | undefined {
		return undefined;
	}

	public getItems(): string[] {
		return this.mb.file.getAllFolders();
	}
}

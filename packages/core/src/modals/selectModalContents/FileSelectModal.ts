import { SelectModalContent } from 'packages/core/src/modals/SelectModalContent';

export class FileSelectModal extends SelectModalContent<string> {
	public getItemText(item: string): string {
		return item;
	}

	public getItems(): string[] {
		return this.plugin.internal.getAllFiles();
	}
}

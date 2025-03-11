import type { MetaBind } from 'packages/core/src';
import { SelectModalContent } from 'packages/core/src/modals/SelectModalContent';

export class FileSelectModal extends SelectModalContent<string> {
	readonly filterFunction?: (filePath: string) => boolean;

	constructor(mb: MetaBind, selectCallback: (value: string) => void, filterFunction?: (filePath: string) => boolean) {
		super(mb, selectCallback);
		this.filterFunction = filterFunction;
	}

	public getItemText(item: string): string {
		return item;
	}

	public getItemDescription(_: string): string | undefined {
		return undefined;
	}

	public getItems(): string[] {
		if (this.filterFunction !== undefined) {
			return this.mb.file.getAllFiles().filter(f => this.filterFunction!(f));
		} else {
			return this.mb.file.getAllFiles();
		}
	}
}

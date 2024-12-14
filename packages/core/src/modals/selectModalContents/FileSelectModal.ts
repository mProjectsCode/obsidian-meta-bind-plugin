import type { IPlugin } from 'packages/core/src/IPlugin';
import { SelectModalContent } from 'packages/core/src/modals/SelectModalContent';

export class FileSelectModal extends SelectModalContent<string> {
	readonly filterFunction?: (filePath: string) => boolean;

	constructor(
		plugin: IPlugin,
		selectCallback: (value: string) => void,
		filterFunction?: (filePath: string) => boolean,
	) {
		super(plugin, selectCallback);
		this.filterFunction = filterFunction;
	}

	public getItemText(item: string): string {
		return item;
	}

	public getItems(): string[] {
		if (this.filterFunction !== undefined) {
			return this.plugin.internal.file.getAllFiles().filter(f => this.filterFunction!(f));
		} else {
			return this.plugin.internal.file.getAllFiles();
		}
	}
}

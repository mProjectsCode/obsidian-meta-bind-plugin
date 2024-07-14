import { SelectModalContent } from 'packages/core/src/modals/SelectModalContent';
import type { Command } from 'packages/core/src/api/InternalAPI';

export class CommandSelectModal extends SelectModalContent<Command> {
	public getItemText(item: Command): string {
		return item.name;
	}

	public getItems(): Command[] {
		return this.plugin.internal.getAllCommands();
	}
}

import type { Command } from 'packages/core/src/api/InternalAPI';
import { SelectModalContent } from 'packages/core/src/modals/SelectModalContent';

export class CommandSelectModal extends SelectModalContent<Command> {
	public getItemText(item: Command): string {
		return item.name;
	}

	public getItemDescription(_: Command): string | undefined {
		return undefined;
	}

	public getItems(): Command[] {
		return this.plugin.internal.getAllCommands();
	}
}

import { FuzzySuggestModal } from 'obsidian';
import type MetaBindPlugin from '../../main';
import { type Command } from 'obsidian';

export class CommandSelectModal extends FuzzySuggestModal<Command> {
	plugin: MetaBindPlugin;
	selectCallback: (selected: Command) => void;
	constructor(plugin: MetaBindPlugin, selectCallback: (selected: Command) => void) {
		super(plugin.app);

		this.plugin = plugin;
		this.selectCallback = selectCallback;
	}

	getItems(): Command[] {
		return this.app.commands.listCommands();
	}

	getItemText(item: Command): string {
		return item.name;
	}

	onChooseItem(item: Command, _evt: MouseEvent | KeyboardEvent): void {
		this.selectCallback(item);
	}
}

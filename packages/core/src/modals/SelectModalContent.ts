import { type IPlugin } from 'packages/core/src/IPlugin';

export abstract class SelectModalContent<T> {
	readonly plugin: IPlugin;
	private readonly selectCallback: (value: T) => void;

	constructor(plugin: IPlugin, selectCallback: (value: T) => void) {
		this.plugin = plugin;
		this.selectCallback = selectCallback;
	}

	/**
	 * Get the text to display for the given item.
	 *
	 * @param item
	 */
	abstract getItemText(item: T): string;

	/**
	 * Get the items to display in the select modal.
	 */
	abstract getItems(): T[];

	public onSelected(item: T): void {
		this.selectCallback(item);
	}
}

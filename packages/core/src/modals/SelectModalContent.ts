import { type IPlugin } from 'packages/core/src/IPlugin';

export abstract class SelectModalContent<T> {
	readonly plugin: IPlugin;
	private readonly selectCallback: (value: T) => void;

	constructor(plugin: IPlugin, selectCallback: (value: T) => void) {
		this.plugin = plugin;
		this.selectCallback = selectCallback;
	}

	abstract getItemText(item: T): string;

	abstract getItems(): T[];

	public onSelected(item: T): void {
		this.selectCallback(item);
	}
}

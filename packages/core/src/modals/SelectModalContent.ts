import type { MetaBind } from '..';

export abstract class SelectModalContent<T> {
	readonly mb: MetaBind;
	private readonly selectCallback: (value: T) => void;

	constructor(mb: MetaBind, selectCallback: (value: T) => void) {
		this.mb = mb;
		this.selectCallback = selectCallback;
	}

	/**
	 * Get the text to display for the given item.
	 *
	 * @param item
	 */
	abstract getItemText(item: T): string;

	/**
	 * Get the description to display for the given item.
	 *
	 * @param item
	 */
	abstract getItemDescription(item: T): string | undefined;

	/**
	 * Get the items to display in the select modal.
	 */
	abstract getItems(): T[];

	public onSelected(item: T): void {
		this.selectCallback(item);
	}
}

import type { IFuzzySearch } from 'packages/core/src/utils/IFuzzySearch';
import { prepareFuzzySearch } from 'obsidian';

export class FuzzySearch implements IFuzzySearch {
	preparedSearch: ReturnType<typeof prepareFuzzySearch> | undefined;

	constructor() {}

	public setSearch(query: string): void {
		this.preparedSearch = prepareFuzzySearch(query);
	}

	public filterItems<T>(items: T[], getItemText: (item: T) => string): T[] {
		if (this.preparedSearch) {
			return items.filter(item => this.preparedSearch?.(getItemText(item))?.score != null);
		}
		return items;
	}
}

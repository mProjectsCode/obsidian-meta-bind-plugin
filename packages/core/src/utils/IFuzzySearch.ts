export interface IFuzzySearch {
	setSearch(query: string): void;

	filterItems<T>(items: T[], getItemText: (item: T) => string): T[];
}

// custom types for the Dataview plugin

declare module 'obsidian-dataview' {
	export interface DataviewApi {
		pages: (query: string, file: string) => DataArray<Record<string, Literal>>;
	}

	export interface DataArray<T> {
		forEach: (callback: (value: T) => void) => void;
	}

	export type DataObject = Record<string, Literal>;
	export type Literal = boolean | number | string | Literal[] | DataObject | Function | null | HTMLElement;
}

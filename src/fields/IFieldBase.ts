import type { IPlugin } from '../IPlugin';

export interface IFieldBase {
	readonly plugin: IPlugin;

	getUuid(): string;

	getFilePath(): string;

	mount(): void;

	destroy(): void;
}

import type { IPlugin } from 'packages/core/src/IPlugin';
import { Mountable } from 'packages/core/src/utils/Mountable';

export abstract class FieldBase extends Mountable {
	readonly plugin: IPlugin;
	private readonly filePath: string;
	private readonly uuid: string;

	protected constructor(plugin: IPlugin, uuid: string, filePath: string) {
		super();

		this.plugin = plugin;
		this.filePath = filePath;
		this.uuid = uuid;
	}

	getUuid(): string {
		return this.uuid;
	}

	getFilePath(): string {
		return this.filePath;
	}
}

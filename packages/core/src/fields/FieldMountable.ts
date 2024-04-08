import type { IPlugin } from 'packages/core/src/IPlugin';
import { Mountable } from 'packages/core/src/utils/Mountable';

export abstract class FieldMountable extends Mountable {
	readonly plugin: IPlugin;
	private readonly filePath: string;
	private readonly uuid: string;

	constructor(plugin: IPlugin, uuid: string, filePath: string) {
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

	protected onMount(_targetEl: HTMLElement): void {
		this.plugin.mountableManager.registerMountable(this);
	}

	protected onUnmount(_targetEl: HTMLElement): void {
		this.plugin.mountableManager.unregisterMountable(this);
	}
}

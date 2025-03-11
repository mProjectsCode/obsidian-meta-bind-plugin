import { Mountable } from 'packages/core/src/utils/Mountable';
import type { MetaBind } from '..';

export abstract class FieldMountable extends Mountable {
	readonly mb: MetaBind;
	private readonly filePath: string;
	private readonly uuid: string;

	constructor(mb: MetaBind, uuid: string, filePath: string) {
		super();

		this.mb = mb;
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
		this.mb.mountableManager.registerMountable(this);
	}

	protected onUnmount(_targetEl: HTMLElement): void {
		this.mb.mountableManager.unregisterMountable(this);
	}
}

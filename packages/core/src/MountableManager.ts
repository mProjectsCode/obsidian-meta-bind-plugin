import type { FieldMountable } from 'packages/core/src/fields/FieldMountable';

export class MountableManager {
	activeMountables: Map<string, FieldMountable>;

	constructor() {
		this.activeMountables = new Map<string, FieldMountable>();
	}

	unloadFile(filePath: string): void {
		for (const mountable of this.activeMountables.values()) {
			if (mountable.getFilePath() === filePath) {
				console.debug(`meta-bind | MountableManager >> unregistered Mountable ${mountable.getUuid()}`);
				mountable.unmount();
			}
		}
	}

	unload(): void {
		for (const mountable of this.activeMountables.values()) {
			console.debug(`meta-bind | MountableManager >> unregistered Mountable ${mountable.getUuid()}`);
			mountable.unmount();
		}
	}

	registerMountable(mountable: FieldMountable): void {
		console.debug(`meta-bind | MountableManager >> registered Mountable ${mountable.getUuid()}`);
		this.activeMountables.set(mountable.getUuid(), mountable);
	}

	unregisterMountable(mountable: FieldMountable): void {
		console.debug(`meta-bind | MountableManager >> unregistered Mountable ${mountable.getUuid()}`);
		this.activeMountables.delete(mountable.getUuid());
	}
}

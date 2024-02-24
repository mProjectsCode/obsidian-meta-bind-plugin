import { type FieldMDRC } from 'packages/obsidian/src/FieldMDRC';

export class MDRCManager {
	activeMDRCs: Map<string, FieldMDRC>;

	constructor() {
		this.activeMDRCs = new Map<string, FieldMDRC>();
	}

	unloadFile(filePath: string): void {
		for (const mdrc of this.activeMDRCs.values()) {
			if (mdrc.filePath === filePath) {
				console.debug(`meta-bind | MDRCManager >> unregistered MDRC ${mdrc.uuid}`);
				mdrc.unload();
			}
		}
	}

	unload(): void {
		for (const mdrc of this.activeMDRCs.values()) {
			console.debug(`meta-bind | MDRCManager >> unregistered MDRC ${mdrc.uuid}`);
			mdrc.unload();
		}
	}

	registerMDRC(mdrc: FieldMDRC): void {
		console.debug(`meta-bind | MDRCManager >> registered MDRC ${mdrc.uuid}`);
		this.activeMDRCs.set(mdrc.uuid, mdrc);
	}

	unregisterMDRC(mdrc: FieldMDRC): void {
		console.debug(`meta-bind | MDRCManager >> unregistered MDRC ${mdrc.uuid}`);
		this.activeMDRCs.delete(mdrc.uuid);
	}
}

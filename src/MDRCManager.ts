import { type AbstractMDRC } from './renderChildren/AbstractMDRC';

export class MDRCManager {
	activeMDRCs: Map<string, AbstractMDRC>;

	constructor() {
		this.activeMDRCs = new Map<string, AbstractMDRC>();
	}

	unload(): void {
		for (const mdrc of this.activeMDRCs.values()) {
			console.debug(`meta-bind | MDRCManager >> unregistered MDRC ${mdrc.uuid}`);
			mdrc.unload();
		}
	}

	registerMDRC(mdrc: AbstractMDRC): void {
		console.debug(`meta-bind | MDRCManager >> registered MDRC ${mdrc.uuid}`);
		this.activeMDRCs.set(mdrc.uuid, mdrc);
	}

	unregisterMDRC(mdrc: AbstractMDRC): void {
		console.debug(`meta-bind | MDRCManager >> unregistered MDRC ${mdrc.uuid}`);
		this.activeMDRCs.delete(mdrc.uuid);
	}
}

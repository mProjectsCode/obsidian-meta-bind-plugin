import { AbstractMDRC } from './renderChildren/AbstractMDRC';

export class MDRCManager {
	activeMDRCs: AbstractMDRC[];

	constructor() {
		this.activeMDRCs = [];
	}

	unload() {
		for (const activeMDRC of this.activeMDRCs) {
			activeMDRC.unload();
		}
	}

	registerMDRC(mdrc: AbstractMDRC): void {
		console.debug(`meta-bind | MDRCManager >> registered MDRC ${mdrc.uuid}`);
		this.activeMDRCs.push(mdrc);
	}

	unregisterMDRC(mdrc: AbstractMDRC): void {
		console.debug(`meta-bind | MDRCManager >> unregistered MDRC ${mdrc.uuid}`);
		this.activeMDRCs = this.activeMDRCs.filter(x => x.uuid !== mdrc.uuid);
	}
}

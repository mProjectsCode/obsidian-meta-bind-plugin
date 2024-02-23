import { $, Verboseness } from 'shellUtils';
import config from './config.json';

async function installScript() {
	for (const corePackage of config.corePackages) {
		await $('bun i', `packages/${corePackage}`, Verboseness.NORMAL);
	}

	for (const nonCorePackage of config.packages) {
		await $('bun i', `packages/${nonCorePackage}`, Verboseness.NORMAL);
	}
}

await installScript();

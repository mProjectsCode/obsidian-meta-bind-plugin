import { $, Verboseness } from 'utils/shellUtils';
import config from './config.json';

async function installScript() {
	for (const corePackage of config.corePackages) {
		await $('rm -rf "node_modules"', `packages/${corePackage}`, Verboseness.VERBOSE);
		await $('rm "bun.lockb"', `packages/${corePackage}`, Verboseness.VERBOSE);
		await $('bun i', `packages/${corePackage}`, Verboseness.VERBOSE);
	}

	for (const nonCorePackage of config.packages) {
		await $('rm -rf "node_modules"', `packages/${nonCorePackage}`, Verboseness.VERBOSE);
		await $('rm "bun.lockb"', `packages/${nonCorePackage}`, Verboseness.VERBOSE);
		await $('bun i', `packages/${nonCorePackage}`, Verboseness.NORMAL);
	}
}

await installScript();

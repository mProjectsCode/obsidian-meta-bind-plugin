import MetaBindPlugin from './main';

export class Logger {
	static plugin: MetaBindPlugin;
	static prefix: string = 'meta-bind |';

	static log(data: any): void {
		console.log(this.prefix, data);
	}

	static logDebug(data: any): void {
		if (this.plugin.settings.devMode) {
			Logger.log(data);
		}
	}

	static logWarning(data: any): void {
		console.warn(this.prefix, data);
	}

	static logError(data: any): void {
		console.error(this.prefix, data);
	}
}

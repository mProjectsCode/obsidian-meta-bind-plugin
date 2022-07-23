export class Logger {
	static devMode: boolean;
	static prefix: string = 'meta-bind |';

	/**
	 * Logs to the console with the plugin prefix
	 *
	 * @param data
	 */
	static log(...data: any): void {
		console.log(this.prefix, ...data);
	}

	/**
	 * Logs to the console with the plugin prefix, if dev mode is turned on in the plugin settings
	 *
	 * @param data
	 */
	static logDebug(...data: any): void {
		if (this.devMode) {
			Logger.log(...data);
		}
	}

	/**
	 * Logs a warning to the console with the plugin prefix
	 *
	 * @param data
	 */
	static logWarning(...data: any): void {
		console.warn(this.prefix, data);
	}

	/**
	 * Logs a warning to the console without the plugin prefix
	 *
	 * @param data
	 */
	static warn(...data: any): void {
		console.warn(data);
	}

	/**
	 * Logs an error to the console with the plugin prefix
	 *
	 * @param data
	 */
	static logError(...data: any): void {
		console.error(this.prefix, data);
	}
}

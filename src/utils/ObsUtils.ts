import { type App } from 'obsidian';
import { type DataviewApi } from 'obsidian-dataview';

export function imagePathToUri(imagePath: string): string {
	// this is using the deprecated app, but it is a pain to pass the app instance through all the svelte components
	return app.vault.adapter.getResourcePath(imagePath);
}

export function getDataViewPluginAPI(app: App): DataviewApi | undefined {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
	return (app.plugins.getPlugin('dataview') as any)?.api as DataviewApi | undefined;
}

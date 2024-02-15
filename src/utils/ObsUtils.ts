import { type DataviewApi } from 'obsidian-dataview';
import type MetaBindPlugin from '../main';
import { type API as JsEngineAPI } from 'jsEngine/api/API';

export function imagePathToUri(imagePath: string): string {
	// this is using the deprecated app, but it is a pain to pass the app instance through all the svelte components
	return app.vault.adapter.getResourcePath(imagePath);
}

export function getDataViewPluginAPI(plugin: MetaBindPlugin): DataviewApi {
	/* eslint-disable */
	const dataViewPlugin = plugin.dependencyManager.checkDependency('dataview');
	return (dataViewPlugin as any).api as DataviewApi;
}

export function getJsEnginePluginAPI(plugin: MetaBindPlugin): JsEngineAPI {
	/* eslint-disable */
	const jsEnginePlugin = plugin.dependencyManager.checkDependency('js-engine');
	return (jsEnginePlugin as any).api as JsEngineAPI;
}

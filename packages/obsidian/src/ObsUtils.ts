import { type API as JsEngineAPI } from 'jsEngine/api/API';
import { type DataviewApi } from 'obsidian-dataview';
import type MetaBindPlugin from 'packages/obsidian/src/main';

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

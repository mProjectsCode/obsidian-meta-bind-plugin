import type { API as JsEngineAPI } from 'jsEngine/api/API';
import type MetaBindPlugin from 'packages/obsidian/src/main';
import type { DataviewApi } from 'obsidian-dataview';
import type { Templater, TemplaterPlugin } from 'packages/obsidian/extraTypes/Templater';

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

export enum Templater_RunMode {
	CreateNewFromTemplate,
	AppendActiveFile,
	OverwriteFile,
	OverwriteActiveFile,
	DynamicProcessor,
	StartupTemplate,
}

export function getTemplaterPluginAPI(plugin: MetaBindPlugin): Templater {
	/* eslint-disable */
	const templaterPlugin = plugin.dependencyManager.checkDependency('templater-obsidian');
	return (templaterPlugin as TemplaterPlugin).templater;
}

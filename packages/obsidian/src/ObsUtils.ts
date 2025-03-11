import type { API as JsEngineAPI } from 'jsEngine/api/API';
import type JsEnginePlugin from 'jsEngine/main';
import type { Plugin } from 'obsidian';
import type { DataviewApi } from 'obsidian-dataview';
import type { Templater, TemplaterPlugin } from 'packages/obsidian/extraTypes/Templater';
import type { ObsMetaBind } from 'packages/obsidian/src/main';

export function getDataViewPluginAPI(mb: ObsMetaBind): DataviewApi {
	const dataViewPlugin = mb.dependencyManager.checkDependency('dataview');
	return (dataViewPlugin as Plugin & { api: DataviewApi }).api;
}

export function getJsEnginePluginAPI(mb: ObsMetaBind): JsEngineAPI {
	const jsEnginePlugin = mb.dependencyManager.checkDependency('js-engine');
	return (jsEnginePlugin as JsEnginePlugin).api;
}

export enum Templater_RunMode {
	CreateNewFromTemplate,
	AppendActiveFile,
	OverwriteFile,
	OverwriteActiveFile,
	DynamicProcessor,
	StartupTemplate,
}

export function getTemplaterPluginAPI(mb: ObsMetaBind): Templater {
	const templaterPlugin = mb.dependencyManager.checkDependency('templater-obsidian');
	return (templaterPlugin as TemplaterPlugin).templater;
}

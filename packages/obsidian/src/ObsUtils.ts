import type { API as JsEngineAPI } from 'jsEngine/api/API';
import type JsEnginePlugin from 'jsEngine/main';
import type { Plugin } from 'obsidian';
import type { DataviewApi } from 'obsidian-dataview';
import type { Templater, TemplaterPlugin } from 'packages/obsidian/extraTypes/Templater';
import type MetaBindPlugin from 'packages/obsidian/src/main';

export function getDataViewPluginAPI(plugin: MetaBindPlugin): DataviewApi {
	const dataViewPlugin = plugin.dependencyManager.checkDependency('dataview');
	return (dataViewPlugin as Plugin & { api: DataviewApi }).api;
}

export function getJsEnginePluginAPI(plugin: MetaBindPlugin): JsEngineAPI {
	const jsEnginePlugin = plugin.dependencyManager.checkDependency('js-engine');
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

export function getTemplaterPluginAPI(plugin: MetaBindPlugin): Templater {
	const templaterPlugin = plugin.dependencyManager.checkDependency('templater-obsidian');
	return (templaterPlugin as TemplaterPlugin).templater;
}

export function isImageExtension(extension: string): boolean {
	const extensions = ['apng', 'avif', 'gif', 'jpg', 'jpeg', 'jfif', 'pjpeg', 'pjp', 'png', 'svg', 'webp'];
	return extensions.contains(extension);
}

import { type Plugin, type PluginManifest } from 'obsidian';

declare module 'obsidian' {
	interface App {
		plugins: {
			enabledPlugins: Set<string>;
			manifests: Record<string, PluginManifest>;
			plugins: Record<string, Plugin>;
			getPlugin: (plugin: string) => Plugin;
		};
	}
}

export {};

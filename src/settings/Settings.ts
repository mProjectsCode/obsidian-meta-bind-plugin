import {App, PluginSettingTab} from 'obsidian';
import MetaBindPlugin from '../main';

export interface MetaBindPluginSettings {

}

export const DEFAULT_SETTINGS: MetaBindPluginSettings = {};

export class MetaBindSettingTab extends PluginSettingTab {
	plugin: MetaBindPlugin;

	constructor(app: App, plugin: MetaBindPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Meta Bind Plugin Settings'});
	}
}

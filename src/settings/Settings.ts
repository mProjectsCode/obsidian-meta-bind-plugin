import {App, PluginSettingTab, Setting} from 'obsidian';
import MetaBindPlugin from '../main';

export interface MetaBindPluginSettings {
	devMode: boolean;
}

export const DEFAULT_SETTINGS: MetaBindPluginSettings = {
	devMode: false,
};

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

		new Setting(containerEl)
			.setName('Dev Mode')
			.setDesc('Enable dev mode. Not recommended unless you want to debug this plugin.')
			.addToggle(cb => {
				cb.setValue(this.plugin.settings.devMode)
					.onChange(data => {
						this.plugin.settings.devMode = data;
						this.plugin.saveSettings();
					});
			});
	}
}

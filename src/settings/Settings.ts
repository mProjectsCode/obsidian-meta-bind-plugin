import {App, PluginSettingTab, Setting} from 'obsidian';
import MetaBindPlugin from '../main';
import {DateFormat} from '../parsers/DateParser';

export interface MetaBindPluginSettings {
	devMode: boolean;
	dateFormat: DateFormat;
	syncInterval: number;
	maxSyncInterval: number;
	minSyncInterval: number;
}

export const DEFAULT_SETTINGS: MetaBindPluginSettings = {
	devMode: false,
	dateFormat: DateFormat.US,
	syncInterval: 200,
	minSyncInterval: 50,
	maxSyncInterval: 1000,
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
			.setName('Sync Interval')
			.setDesc(`The interval in milli-seconds between disk writes. Changing this number is not recommended except if your hard drive is exceptionally slow. Standard: ${DEFAULT_SETTINGS.syncInterval}; Minimum: ${DEFAULT_SETTINGS.minSyncInterval}; Maximum: ${DEFAULT_SETTINGS.maxSyncInterval}`)
			.addText(cb => {
				cb.setValue(this.plugin.settings.syncInterval.toString());
				cb.onChange(data => {
					this.plugin.settings.syncInterval = Number.parseInt(data);
					if (Number.isNaN(this.plugin.settings.syncInterval)) {
						this.plugin.settings.syncInterval = DEFAULT_SETTINGS.syncInterval;
					}
					if (this.plugin.settings.syncInterval < DEFAULT_SETTINGS.minSyncInterval) {
						this.plugin.settings.syncInterval = DEFAULT_SETTINGS.minSyncInterval;
					}
					if (this.plugin.settings.syncInterval > DEFAULT_SETTINGS.maxSyncInterval) {
						this.plugin.settings.syncInterval = DEFAULT_SETTINGS.maxSyncInterval;
					}
					this.plugin.saveSettings();
				});
			});

		new Setting(containerEl)
			.setName('Date format')
			.setDesc(`The date format to be used by this plugin.`)
			.addDropdown(cb => {
				cb.addOptions({
					'us': 'US date format (1/30/2022)',
					'eu': 'EU date format (30/1/2022)',
					'f_us': 'US date format (January 30, 2022)',
					'fs_us': 'US date format (Jan 30, 2022)',
				});
				cb.onChange(data => {
					this.plugin.settings.dateFormat = data as DateFormat;
					this.plugin.saveSettings();
				});
			});

		new Setting(containerEl)
			.setName('Dev Mode')
			.setDesc('Enable dev mode. Not recommended unless you want to debug this plugin.')
			.addToggle(cb => {
				cb.setValue(this.plugin.settings.devMode);
				cb.onChange(data => {
					this.plugin.settings.devMode = data;
					this.plugin.saveSettings();
				});
			});
	}
}

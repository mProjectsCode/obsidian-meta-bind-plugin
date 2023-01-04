import { App, PluginSettingTab, Setting, TextAreaComponent } from 'obsidian';
import MetaBindPlugin from '../main';
import { firstWeekday, setFirstWeekday, Weekday, weekdays } from '../inputFields/DatePicker/DatePickerInputSvelteHelpers';

export interface MetaBindPluginSettings {
	devMode: boolean;
	ignoreCodeBlockRestrictions: boolean;
	preferredDateFormat: string;
	useUsDateInputOrder: boolean;
	firstWeekday: Weekday;
	syncInterval: number;
	maxSyncInterval: number;
	minSyncInterval: number;

	inputTemplates: string;
}

export const DEFAULT_SETTINGS: MetaBindPluginSettings = {
	devMode: false,
	ignoreCodeBlockRestrictions: false,
	preferredDateFormat: 'YYYY-MM-DD',
	useUsDateInputOrder: false,
	firstWeekday: weekdays[1],
	syncInterval: 200,
	minSyncInterval: 50,
	maxSyncInterval: 1000,

	inputTemplates: '',
};

export class MetaBindSettingTab extends PluginSettingTab {
	plugin: MetaBindPlugin;

	constructor(app: App, plugin: MetaBindPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl('h2', { text: 'Meta Bind Plugin Settings' });

		new Setting(containerEl)
			.setName('Sync interval')
			.setDesc(
				`The interval in milli-seconds between disk writes. Changing this number is not recommended except if your hard drive is exceptionally slow. Standard: ${DEFAULT_SETTINGS.syncInterval}; Minimum: ${DEFAULT_SETTINGS.minSyncInterval}; Maximum: ${DEFAULT_SETTINGS.maxSyncInterval}`
			)
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
			.setDesc(
				`The date format to be used by this plugin. Changing this setting will break the parsing of existing date inputs. Here is a list of all available date tokes https://momentjs.com/docs/#/displaying/.`
			)
			.addText(cb => {
				cb.setValue(this.plugin.settings.preferredDateFormat);
				cb.onChange(data => {
					this.plugin.settings.preferredDateFormat = data;
					this.plugin.saveSettings();
				});
			});

		new Setting(containerEl)
			.setName('Use US date input field order')
			.setDesc(`When enabled the month input is before the day input.`)
			.addToggle(cb => {
				cb.setValue(this.plugin.settings.useUsDateInputOrder);
				cb.onChange(data => {
					this.plugin.settings.useUsDateInputOrder = data;
					this.plugin.saveSettings();
				});
			});

		new Setting(containerEl)
			.setName('First Weekday')
			.setDesc(`Specify the first weekday for the datepicker.`)
			.addDropdown(cb => {
				for (const weekday of weekdays) {
					cb.addOption(weekday.name, weekday.name);
				}
				cb.setValue(this.plugin.settings.firstWeekday.name);
				cb.onChange(data => {
					const w: Weekday = weekdays.find(x => x.name === data)!;
					this.plugin.settings.firstWeekday = w;
					this.plugin.saveSettings();
				});
			});

		new Setting(containerEl)
			.setName('Templates')
			.setDesc(`You can specify templates here, and access them using \`INPUT[template_name][overrides (optional)]\` in your notes.`);

		const ta = new TextAreaComponent(containerEl);
		ta.setValue(this.plugin.settings.inputTemplates);
		ta.setPlaceholder('template_name -> INPUT[input_type(argument(value)):bind_target]');
		ta.inputEl.style.width = '100%';
		ta.inputEl.style.height = '200px';
		ta.onChange(data => {
			this.plugin.settings.inputTemplates = data;
			this.plugin.saveSettings();
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

		new Setting(containerEl)
			.setName('Disable Code Block Restrictions')
			.setDesc('Disable restrictions on which input fields can be created in which code blocks. Not recommended unless you know what you are doing.')
			.addToggle(cb => {
				cb.setValue(this.plugin.settings.ignoreCodeBlockRestrictions);
				cb.onChange(data => {
					this.plugin.settings.ignoreCodeBlockRestrictions = data;
					this.plugin.saveSettings();
				});
			});
	}
}

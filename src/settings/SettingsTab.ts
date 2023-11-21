import { type App, PluginSettingTab, Setting } from 'obsidian';
import type MetaBindPlugin from '../main';
import { DEFAULT_SETTINGS, weekdays } from './Settings';
import { ExcludedFoldersSettingModal } from './excludedFoldersSetting/ExcludedFoldersSettingModal';
import { InputFieldTemplatesSettingModal } from './inputFieldTemplateSetting/InputFieldTemplatesSettingModal';
import { DocsHelper } from '../utils/DocsHelper';
import { MB_FAQ_VIEW_TYPE } from '../faq/FaqView';

export class MetaBindSettingTab extends PluginSettingTab {
	plugin: MetaBindPlugin;

	constructor(app: App, plugin: MetaBindPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Quick access')
			.addButton(cb => {
				cb.setCta();
				cb.setButtonText('Docs');
				cb.onClick(() => {
					DocsHelper.open(DocsHelper.linkToHome());
				});
			})
			.addButton(cb => {
				cb.setButtonText('Open FAQ');
				cb.onClick(() => {
					void this.plugin.activateView(MB_FAQ_VIEW_TYPE);
				});
			})
			.addButton(cb => {
				cb.setButtonText('GitHub');
				cb.onClick(() => {
					DocsHelper.open(DocsHelper.linkToGithub());
				});
			})
			.addButton(cb => {
				cb.setButtonText('Report Issue');
				cb.onClick(() => {
					DocsHelper.open(DocsHelper.linkToIssues());
				});
			});

		new Setting(containerEl)
			.setName('Sync interval')
			.setDesc(
				`The interval in milli-seconds between disk writes. Changing this number is not recommended except if your hard drive is exceptionally slow. Standard: ${DEFAULT_SETTINGS.syncInterval}; Minimum: ${DEFAULT_SETTINGS.minSyncInterval}; Maximum: ${DEFAULT_SETTINGS.maxSyncInterval}`,
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
					void this.plugin.saveSettings();
				});
			});

		new Setting(containerEl)
			.setName('Date format')
			.setDesc(
				`The date format to be used by this plugin. Changing this setting will break the parsing of existing date inputs. Here is a list of all available date tokes https://momentjs.com/docs/#/displaying/.`,
			)
			.addText(cb => {
				cb.setValue(this.plugin.settings.preferredDateFormat);
				cb.onChange(data => {
					this.plugin.settings.preferredDateFormat = data;
					void this.plugin.saveSettings();
				});
			});

		new Setting(containerEl)
			.setName('Use US date input field order')
			.setDesc(`When enabled the month input is before the day input.`)
			.addToggle(cb => {
				cb.setValue(this.plugin.settings.useUsDateInputOrder);
				cb.onChange(data => {
					this.plugin.settings.useUsDateInputOrder = data;
					void this.plugin.saveSettings();
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
					this.plugin.settings.firstWeekday = weekdays.find(x => x.name === data)!;
					void this.plugin.saveSettings();
				});
			});

		new Setting(containerEl)
			.setName('Templates')
			.setDesc(
				`You can specify templates here, and access them using \`INPUT[template_name][overrides (optional)]\` in your notes.`,
			)
			.addButton(cb => {
				cb.setButtonText('Edit Templates');
				cb.onClick(() => {
					new InputFieldTemplatesSettingModal(this.app, this.plugin).open();
				});
			});

		new Setting(containerEl)
			.setName('Excluded Folders')
			.setDesc(`You can specify excluded folders here. The plugin will not work within excluded folders.`)
			.addButton(cb => {
				cb.setButtonText('Edit Excluded Folders');
				cb.onClick(() => {
					new ExcludedFoldersSettingModal(this.app, this.plugin).open();
				});
			});

		new Setting(containerEl)
			.setName('View Fields display null as empty')
			.setDesc('Display nothing instead of null, if the frontmatter value is empty, in text view fields.')
			.addToggle(cb => {
				cb.setValue(this.plugin.settings.viewFieldDisplayNullAsEmpty);
				cb.onChange(data => {
					this.plugin.settings.viewFieldDisplayNullAsEmpty = data;
					void this.plugin.saveSettings();
				});
			});

		new Setting(containerEl)
			.setName('Enable JS Input Fields')
			.setDesc(
				"Enable the processing of JavaScript input fields. This is potentially DANGEROUS, thus it's disabled by default. RESTART REQUIRED.",
			)
			.addToggle(cb => {
				cb.setValue(this.plugin.settings.enableJs);
				cb.onChange(data => {
					this.plugin.settings.enableJs = data;
					void this.plugin.saveSettings();
				});
			});

		containerEl.createEl('h2', { text: 'Advanced Settings' });

		new Setting(containerEl)
			.setName('Dev Mode')
			.setDesc('Enable dev mode. Not recommended unless you want to debug this plugin.')
			.addToggle(cb => {
				cb.setValue(this.plugin.settings.devMode);
				cb.onChange(data => {
					this.plugin.settings.devMode = data;
					void this.plugin.saveSettings();
				});
			});

		new Setting(containerEl)
			.setName('Disable Code Block Restrictions')
			.setDesc(
				'Disable restrictions on which input fields can be created in which code blocks. Not recommended unless you know what you are doing.',
			)
			.addToggle(cb => {
				cb.setValue(this.plugin.settings.ignoreCodeBlockRestrictions);
				cb.onChange(data => {
					this.plugin.settings.ignoreCodeBlockRestrictions = data;
					void this.plugin.saveSettings();
				});
			});
	}
}

import { type App, ButtonComponent, PluginSettingTab, Setting } from 'obsidian';
import { DEFAULT_SETTINGS, weekdays } from 'packages/core/src/Settings';
import { DocsUtils } from 'packages/core/src/utils/DocsUtils';
import { MB_FAQ_VIEW_TYPE } from 'packages/obsidian/src/faq/FaqView';
import type MetaBindPlugin from 'packages/obsidian/src/main';
import { MetaBindBuild } from 'packages/obsidian/src/main';
import { ButtonTemplatesSettingModal } from 'packages/obsidian/src/settings/buttonTemplateSetting/ButtonTemplatesSettingModal';
import { ExcludedFoldersSettingModal } from 'packages/obsidian/src/settings/excludedFoldersSetting/ExcludedFoldersSettingModal';
import { InputFieldTemplatesSettingModal } from 'packages/obsidian/src/settings/inputFieldTemplateSetting/InputFieldTemplatesSettingModal';

export class MetaBindSettingTab extends PluginSettingTab {
	plugin: MetaBindPlugin;

	constructor(app: App, plugin: MetaBindPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		if (this.plugin.build === MetaBindBuild.DEV || this.plugin.build === MetaBindBuild.CANARY) {
			containerEl.createEl('p', {
				text: `You are using a ${this.plugin.build} build (${this.plugin.manifest.version}). This build is not intended for production use. Use at your own risk.`,
				cls: 'mb-error',
			});
			const button = new ButtonComponent(containerEl);
			button.setButtonText('Learn About Canary Builds');
			button.setCta();
			button.onClick(() => {
				DocsUtils.open(DocsUtils.linkToCanaryBuilds());
			});
		}

		new Setting(containerEl)
			.setName('Quick access')
			.addButton(cb => {
				cb.setCta();
				cb.setButtonText('Docs');
				cb.onClick(() => {
					DocsUtils.open(DocsUtils.linkToHome());
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
					DocsUtils.open(DocsUtils.linkToGithub());
				});
			})
			.addButton(cb => {
				cb.setButtonText('Report Issue');
				cb.onClick(() => {
					DocsUtils.open(DocsUtils.linkToIssues());
				});
			});

		containerEl.createEl('h2', { text: 'General Settings' });

		new Setting(containerEl)
			.setName('Enable Syntax Highlighting')
			.setDesc(`Enable syntax highlighting for. RESTART REQUIRED.`)
			.addToggle(cb => {
				cb.setValue(this.plugin.settings.enableSyntaxHighlighting);
				cb.onChange(data => {
					this.plugin.settings.enableSyntaxHighlighting = data;
					void this.plugin.saveSettings();
				});
			});

		new Setting(containerEl)
			.setName('Enable Editor Right Click Menu')
			.setDesc(`Enable a meta bind menu section in the editor right click menu. RESTART REQUIRED.`)
			.addToggle(cb => {
				cb.setValue(this.plugin.settings.enableEditorRightClickMenu);
				cb.onChange(data => {
					this.plugin.settings.enableEditorRightClickMenu = data;
					void this.plugin.saveSettings();
				});
			});

		new Setting(containerEl)
			.setName('Input Field Templates')
			.setDesc(
				`You can specify input field templates here, and access them using \`INPUT[template_name][overrides (optional)]\` in your notes.`,
			)
			.addButton(cb => {
				cb.setButtonText('Edit Templates');
				cb.onClick(() => {
					new InputFieldTemplatesSettingModal(this.app, this.plugin).open();
				});
			});

		new Setting(containerEl)
			.setName('Button Templates')
			.setDesc(`You can specify button field templates here, and access them in inline buttons.`)
			.addButton(cb => {
				cb.setButtonText('Edit Templates');
				cb.onClick(() => {
					new ButtonTemplatesSettingModal(this.app, this.plugin).open();
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

		containerEl.createEl('h2', { text: 'Date and Time Settings' });

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
	}
}

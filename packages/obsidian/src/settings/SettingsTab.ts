import type { App } from 'obsidian';
import { ButtonComponent, PluginSettingTab, Setting } from 'obsidian';
import { MetaBindBuild } from 'packages/core/src';
import { DEFAULT_SETTINGS, MAX_SYNC_INTERVAL, MIN_SYNC_INTERVAL, weekdays } from 'packages/core/src/Settings';
import { DocsUtils } from 'packages/core/src/utils/DocsUtils';
import type { ObsMetaBind } from 'packages/obsidian/src/main';
import { MB_PLAYGROUND_VIEW_TYPE } from 'packages/obsidian/src/playground/PlaygroundView';
import { ButtonTemplatesSettingModal } from 'packages/obsidian/src/settings/buttonTemplateSetting/ButtonTemplatesSettingModal';
import { ExcludedFoldersSettingModal } from 'packages/obsidian/src/settings/excludedFoldersSetting/ExcludedFoldersSettingModal';
import { InputFieldTemplatesSettingModal } from 'packages/obsidian/src/settings/inputFieldTemplateSetting/InputFieldTemplatesSettingModal';

export class MetaBindSettingTab extends PluginSettingTab {
	mb: ObsMetaBind;

	constructor(app: App, mb: ObsMetaBind) {
		super(app, mb.plugin);
		this.mb = mb;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		if (this.mb.build === MetaBindBuild.DEV || this.mb.build === MetaBindBuild.CANARY) {
			containerEl.createEl('p', {
				text: `You are using a ${this.mb.build} build (${MB_VERSION}). This build is not intended for production use. Use at your own risk.`,
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
					void this.mb.activateView(MB_PLAYGROUND_VIEW_TYPE);
				});
			})
			.addButton(cb => {
				cb.setButtonText('GitHub');
				cb.onClick(() => {
					DocsUtils.open(DocsUtils.linkToGithub());
				});
			})
			.addButton(cb => {
				cb.setButtonText('Report issue');
				cb.onClick(() => {
					DocsUtils.open(DocsUtils.linkToIssues());
				});
			});

		new Setting(containerEl)
			.setName('Enable syntax highlighting')
			.setDesc(`Enable syntax highlighting for meta bind syntax. RESTART REQUIRED.`)
			.addToggle(cb => {
				cb.setValue(this.mb.getSettings().enableSyntaxHighlighting);
				cb.onChange(data => {
					this.mb.updateSettings(settings => {
						settings.enableSyntaxHighlighting = data;
					});
				});
			});

		new Setting(containerEl)
			.setName('Enable editor right-click menu')
			.setDesc(`Enable a meta bind menu section in the editor right-click menu. RESTART REQUIRED.`)
			.addToggle(cb => {
				cb.setValue(this.mb.getSettings().enableEditorRightClickMenu);
				cb.onChange(data => {
					this.mb.updateSettings(settings => {
						settings.enableEditorRightClickMenu = data;
					});
				});
			});

		new Setting(containerEl)
			.setName('Input field templates')
			.setDesc(
				`You can specify input field templates here, and access them using \`INPUT[template_name][overrides (optional)]\` in your notes.`,
			)
			.addButton(cb => {
				cb.setButtonText('Edit templates');
				cb.onClick(() => {
					new InputFieldTemplatesSettingModal(this.app, this.mb).open();
				});
			});

		new Setting(containerEl)
			.setName('Button templates')
			.setDesc(`You can specify button field templates here, and access them in inline buttons.`)
			.addButton(cb => {
				cb.setButtonText('Edit templates');
				cb.onClick(() => {
					new ButtonTemplatesSettingModal(this.app, this.mb).open();
				});
			});

		new Setting(containerEl)
			.setName('Excluded folders')
			.setDesc(`You can specify excluded folders here. The plugin will not work within excluded folders.`)
			.addButton(cb => {
				cb.setButtonText('Edit excluded folders');
				cb.onClick(() => {
					new ExcludedFoldersSettingModal(this.app, this.mb).open();
				});
			});

		new Setting(containerEl)
			.setName('View fields display null as empty')
			.setDesc('Display nothing instead of null, if the frontmatter value is empty, in text view fields.')
			.addToggle(cb => {
				cb.setValue(this.mb.getSettings().viewFieldDisplayNullAsEmpty);
				cb.onChange(data => {
					this.mb.updateSettings(settings => {
						settings.viewFieldDisplayNullAsEmpty = data;
					});
				});
			});

		new Setting(containerEl)
			.setName('Enable JavaScript')
			.setDesc(
				"Enable features that run user written JavaScript. This is potentially DANGEROUS, thus it's disabled by default. RESTART REQUIRED.",
			)
			.addToggle(cb => {
				cb.setValue(this.mb.getSettings().enableJs);
				cb.onChange(data => {
					this.mb.updateSettings(settings => {
						settings.enableJs = data;
					});
				});
			});

		new Setting(containerEl).setName('Date and time').setHeading();

		new Setting(containerEl)
			.setName('Date format')
			.setDesc(
				`The date format to be used by this plugin. Changing this setting will break the parsing of existing date inputs. Here is a list of all available date tokes https://momentjs.com/docs/#/displaying/.`,
			)
			.addText(cb => {
				cb.setValue(this.mb.getSettings().preferredDateFormat);
				cb.onChange(data => {
					this.mb.updateSettings(settings => {
						settings.preferredDateFormat = data;
					});
				});
			});

		new Setting(containerEl)
			.setName('First weekday')
			.setDesc(`Specify the first weekday for the datepicker.`)
			.addDropdown(cb => {
				for (const weekday of weekdays) {
					cb.addOption(weekday.name, weekday.name);
				}
				cb.setValue(this.mb.getSettings().firstWeekday.name);
				cb.onChange(data => {
					this.mb.updateSettings(settings => {
						settings.firstWeekday = weekdays.find(x => x.name === data)!;
					});
				});
			});

		new Setting(containerEl).setName('Advanced').setHeading();

		new Setting(containerEl)
			.setName('Dev mode')
			.setDesc('Enable dev mode. Not recommended unless you want to debug this plugin.')
			.addToggle(cb => {
				cb.setValue(this.mb.getSettings().devMode);
				cb.onChange(data => {
					this.mb.updateSettings(settings => {
						settings.devMode = data;
					});
				});
			});

		new Setting(containerEl)
			.setName('Disable code block restrictions')
			.setDesc(
				'Disable restrictions on which input fields can be created in which code blocks. Not recommended unless you know what you are doing.',
			)
			.addToggle(cb => {
				cb.setValue(this.mb.getSettings().ignoreCodeBlockRestrictions);
				cb.onChange(data => {
					this.mb.updateSettings(settings => {
						settings.ignoreCodeBlockRestrictions = data;
					});
				});
			});

		new Setting(containerEl)
			.setName('Sync interval')
			.setDesc(
				`The interval in milli-seconds between disk writes. Changing this number is not recommended except if your hard drive is exceptionally slow. Standard: ${DEFAULT_SETTINGS.syncInterval}; Minimum: ${MIN_SYNC_INTERVAL}; Maximum: ${MAX_SYNC_INTERVAL}`,
			)
			.addText(cb => {
				cb.setValue(this.mb.getSettings().syncInterval.toString());
				cb.onChange(data => {
					this.mb.updateSettings(settings => {
						settings.syncInterval = Number.parseInt(data);
						if (Number.isNaN(settings.syncInterval)) {
							settings.syncInterval = DEFAULT_SETTINGS.syncInterval;
						}
						if (settings.syncInterval < MIN_SYNC_INTERVAL) {
							settings.syncInterval = MIN_SYNC_INTERVAL;
						}
						if (settings.syncInterval > MAX_SYNC_INTERVAL) {
							settings.syncInterval = MAX_SYNC_INTERVAL;
						}
					});
				});
			});
	}
}

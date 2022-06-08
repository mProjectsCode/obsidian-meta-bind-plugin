import {FrontMatterCache, Plugin, stringifyYaml, TFile} from 'obsidian';
import {DEFAULT_SETTINGS, MetaBindPluginSettings, MetaBindSettingTab} from './settings/Settings';
import {InputField} from './InputField';

export default class MetaBindPlugin extends Plugin {
	settings: MetaBindPluginSettings;

	async onload() {
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {

		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');


		this.registerMarkdownPostProcessor((element, context) => {
			const codeblocks = element.querySelectorAll('code');
			for (let index = 0; index < codeblocks.length; index++) {
				const codeblock = codeblocks.item(index);
				const text = codeblock.innerText;
				const isEmoji = text.startsWith('INPUT[') && text.endsWith(']');
				console.log(context.sourcePath);
				if (isEmoji) {
					context.addChild(new InputField(codeblock, text, this, context.frontmatter, context.sourcePath));
				}
			}
		});


		this.addSettingTab(new MetaBindSettingTab(this.app, this));
	}

	onunload() {

	}

	async updateMetaData(key: string, value: any, filePath: string) {
		const file = await this.app.vault.getAbstractFileByPath(filePath) as TFile;
		let fileContent: string = await this.app.vault.read(file);
		const regExp = new RegExp('^(---)\\n[\\s\\S]*\\n---');
		fileContent = fileContent.replace(regExp, '');

		let metadata: FrontMatterCache = this.app.metadataCache.getFileCache(file).frontmatter;
		delete metadata.position;
		metadata[key] = value;

		fileContent = `---\n${stringifyYaml(metadata)}---` + fileContent;
		await this.app.vault.modify(file, fileContent);
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

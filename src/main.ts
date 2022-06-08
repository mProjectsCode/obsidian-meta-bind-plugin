import {Notice, Plugin, stringifyYaml, TFile} from 'obsidian';
import {DEFAULT_SETTINGS, MetaBindPluginSettings, MetaBindSettingTab} from './settings/Settings';
import {InputField} from './InputField';
import {getFileName, removeFileEnding} from './Utils';

export default class MetaBindPlugin extends Plugin {
	settings: MetaBindPluginSettings;

	async onload() {
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {

		});


		this.registerMarkdownPostProcessor((element, context) => {
			const codeblocks = element.querySelectorAll('code');
			for (let index = 0; index < codeblocks.length; index++) {
				const codeblock = codeblocks.item(index);
				const text = codeblock.innerText;
				const isEmoji = text.startsWith('INPUT[') && text.endsWith(']');
				// console.log(context.sourcePath);
				if (isEmoji) {
					context.addChild(new InputField(codeblock, text, this, context.sourcePath));
				}
			}
		});

		this.registerEvent(this.app.vault.on('modify', () => {
			// console.log('file modified')
		}));

		this.addSettingTab(new MetaBindSettingTab(this.app, this));
	}

	onunload() {

	}

	async updateMetaData(key: string, value: any, file: TFile) {
		if (!file) {
			console.log('file not found');
			return;
		}

		let fileContent: string = await this.app.vault.read(file);
		const regExp = new RegExp('^(---)\\n[\\s\\S]*\\n---');
		fileContent = fileContent.replace(regExp, '');

		let metadata: any = this.getMetaDataForFile(file);
		if (!metadata) {
			return;
		}

		metadata[key] = value;

		fileContent = `---\n${stringifyYaml(metadata)}---` + fileContent;
		await this.app.vault.modify(file, fileContent);
	}

	getFileByName(name: string): TFile {
		// console.log(getFileName(removeFileEnding(name)))
		const files = this.app.vault.getFiles();
		for (const file of files) {
			// console.log(getFileName(removeFileEnding(file.name)));
			if (getFileName(removeFileEnding(file.name)) === getFileName(removeFileEnding(name))) {
				return file;
			}
		}

		return null;
	}

	getMetaDataForFile(file: TFile): any {
		let metadata: any;
		try {
			metadata = this.app.metadataCache.getFileCache(file).frontmatter;
		} catch (e) {
			new Notice('Waring: ' + e.toString());
			return;
		}

		if (metadata) {
			delete metadata.position;
		} else {
			metadata = {};
		}

		return metadata;
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

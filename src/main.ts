import {Notice, Plugin, stringifyYaml, TFile} from 'obsidian';
import {DEFAULT_SETTINGS, MetaBindPluginSettings, MetaBindSettingTab} from './settings/Settings';
import {InputField} from './InputField';
import {getFileName, isPath, removeFileEnding} from './Utils';

export default class MetaBindPlugin extends Plugin {
	settings: MetaBindPluginSettings;

	async onload() {
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {

		});


		this.registerMarkdownPostProcessor((element, context) => {
			const codeBlocks = element.querySelectorAll('code');
			for (let index = 0; index < codeBlocks.length; index++) {
				const codeBlock = codeBlocks.item(index);
				const text = codeBlock.innerText;
				const isInputField = text.startsWith('INPUT[') && text.endsWith(']');
				// console.log(context.sourcePath);
				if (isInputField) {
					context.addChild(new InputField(codeBlock, text, this, context.sourcePath));
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
		// console.log('update', key, value);

		if (!file) {
			console.log('no file');
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

	getFilesByName(name: string): TFile[] {
		// console.log(getFileName(removeFileEnding(name)))
		const allFiles = this.app.vault.getFiles();
		const files: TFile[] = [];
		for (const file of allFiles) {
			// console.log(removeFileEnding(file.path));
			if (isPath(name)) {
				if (removeFileEnding(file.path) === removeFileEnding(name)) {
					files.push(file);
				}
			} else {
				if (getFileName(removeFileEnding(file.name)) === getFileName(removeFileEnding(name))) {
					files.push(file);
				}
			}
		}

		return files;
	}

	getMetaDataForFile(file: TFile): any {
		let metadata: any;
		try {
			metadata = this.app.metadataCache.getFileCache(file).frontmatter;
			metadata = JSON.parse(JSON.stringify(metadata)); // deep copy
			// console.log(metadata);
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

import {parseYaml, Plugin, stringifyYaml, TFile} from 'obsidian';
import {DEFAULT_SETTINGS, MetaBindPluginSettings, MetaBindSettingTab} from './settings/Settings';
import {MarkdownInputField} from './MarkdownInputField';
import {getFileName, isPath, removeFileEnding} from './Utils';
import {Logger} from './Logger';

export default class MetaBindPlugin extends Plugin {
	settings: MetaBindPluginSettings;

	activeMarkdownInputFields: MarkdownInputField[];
	markDownInputFieldIndex: number;

	async onload() {
		await this.loadSettings();

		Logger.plugin = this;

		this.activeMarkdownInputFields = [];
		this.markDownInputFieldIndex = 0;

		this.registerMarkdownPostProcessor((element, context) => {
			const codeBlocks = element.querySelectorAll('code');
			for (let index = 0; index < codeBlocks.length; index++) {
				const codeBlock = codeBlocks.item(index);
				const text = codeBlock.innerText;
				const isInputField = text.startsWith('INPUT[') && text.endsWith(']');
				// console.log(context.sourcePath);
				if (isInputField) {
					context.addChild(new MarkdownInputField(codeBlock, text, this, context.sourcePath, this.markDownInputFieldIndex));
					this.markDownInputFieldIndex += 1;
				}
			}
		});

		this.registerEvent(this.app.vault.on('modify', async abstractFile => {
			if (abstractFile instanceof TFile) {
				await this.updateMarkdownInputFieldsOnFileChange(abstractFile as TFile);
			}
		}));

		this.addSettingTab(new MetaBindSettingTab(this.app, this));
	}

	onunload() {
		for (const activeMarkdownInputField of this.activeMarkdownInputFields) {
			activeMarkdownInputField.unload();
		}
	}

	registerMarkdownInputField(markdownInputField: MarkdownInputField) {
		this.activeMarkdownInputFields.push(markdownInputField);
	}

	unregisterMarkdownInputField(markdownInputField: MarkdownInputField) {
		this.activeMarkdownInputFields = this.activeMarkdownInputFields.filter(x => x.uid !== markdownInputField.uid);
	}

	async updateMarkdownInputFieldsOnFileChange(file: TFile) {
		const metadata = await this.getMetaDataForFile(file);

		for (const activeMarkdownInputField of this.activeMarkdownInputFields) {
			if (!activeMarkdownInputField.file || !activeMarkdownInputField.isBound) {
				continue;
			}

			if (activeMarkdownInputField.file.path === file.path) {
				activeMarkdownInputField.updateValue(metadata[activeMarkdownInputField.boundMetadataField]);
			}
		}
	}

	async updateMetaData(key: string, value: any, file: TFile) {
		Logger.logDebug(`updating '${key}: ${value}' in '${file.path}'`);

		if (!file) {
			console.log('no file');
			return;
		}

		let fileContent: string = await this.app.vault.read(file);
		const regExp = new RegExp('^(---)\\n[\\s\\S]*\\n---');
		fileContent = fileContent.replace(regExp, '');

		let metadata: any = await this.getMetaDataForFile(file);
		// console.log(metadata);
		if (!metadata) {
			return;
		}

		metadata[key] = value;
		// console.log(metadata);

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

	async getMetaDataForFile(file: TFile): Promise<any> {
		// console.log(`reading metadata for ${file.path}`);

		let metadata: any;

		/* metadata cache is unreliable and might not be updated yet
		try {
			metadata = this.app.metadataCache.getFileCache(file).frontmatter;
		} catch (e) {
			new Notice('Waring: ' + e.toString());
			console.warn(e.toString());
			return;
		}

		if (metadata) {
			metadata = JSON.parse(JSON.stringify(metadata)); // deep copy
			delete metadata.position;
		} else {
			metadata = {};
		}
		*/

		let fileContent: string = await this.app.vault.read(file);
		const regExp = new RegExp('^(---)\\n[\\s\\S]*\\n---');
		let frontMatter = regExp.exec(fileContent)[0];
		if (frontMatter === null) {
			return {};
		}
		// console.log(frontMatter);
		frontMatter = frontMatter.substring(4);
		frontMatter = frontMatter.substring(0, frontMatter.length - 3);
		// console.log(frontMatter);

		metadata = parseYaml(frontMatter);

		if (!metadata) {
			metadata = {};
		}

		//console.log(metadata);

		return metadata;
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

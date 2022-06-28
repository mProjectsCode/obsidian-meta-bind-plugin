import {parseYaml, Plugin, stringifyYaml, TFile} from 'obsidian';
import {DEFAULT_SETTINGS, MetaBindPluginSettings, MetaBindSettingTab} from './settings/Settings';
import {InputFieldMarkdownRenderChild, InputFieldMarkdownRenderChildType} from './InputFieldMarkdownRenderChild';
import {getFileName, isPath, removeFileEnding} from './utils/Utils';
import {Logger} from './utils/Logger';
import {DateParser} from './parsers/DateParser';

export default class MetaBindPlugin extends Plugin {
	settings: MetaBindPluginSettings;

	activeMarkdownInputFields: InputFieldMarkdownRenderChild[];
	markDownInputFieldIndex: number;

	async onload() {
		await this.loadSettings();

		Logger.devMode = this.settings.devMode;
		DateParser.dateFormat = this.settings.dateFormat;

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
					context.addChild(new InputFieldMarkdownRenderChild(codeBlock, InputFieldMarkdownRenderChildType.INLINE_CODE_BLOCK, text, this, context.sourcePath, this.markDownInputFieldIndex));
					this.markDownInputFieldIndex += 1;
				}
			}
		});

		this.registerMarkdownCodeBlockProcessor('meta-bind', (source, el, ctx) => {
			const codeBlock = el;
			const text = source.replace(/\n/g, '');
			const isInputField = text.startsWith('INPUT[') && text.endsWith(']');
			// console.log(context.sourcePath);
			if (isInputField) {
				ctx.addChild(new InputFieldMarkdownRenderChild(codeBlock, InputFieldMarkdownRenderChildType.CODE_BLOCK, text, this, ctx.sourcePath, this.markDownInputFieldIndex));
				this.markDownInputFieldIndex += 1;
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

	registerMarkdownInputField(markdownInputField: InputFieldMarkdownRenderChild) {
		this.activeMarkdownInputFields.push(markdownInputField);
	}

	unregisterMarkdownInputField(markdownInputField: InputFieldMarkdownRenderChild) {
		this.activeMarkdownInputFields = this.activeMarkdownInputFields.filter(x => x.uid !== markdownInputField.uid);
	}

	async updateMarkdownInputFieldsOnFileChange(file: TFile) {
		let metadata: any = undefined;

		for (const activeMarkdownInputField of this.activeMarkdownInputFields) {
			if (!activeMarkdownInputField.bindTargetFile || !activeMarkdownInputField.inputFieldDeclaration.isBound) {
				continue;
			}

			if (activeMarkdownInputField.bindTargetFile.path === file.path) {
				if (metadata === undefined) {
					metadata = await this.getMetaDataForFile(file);
				}
				activeMarkdownInputField.updateValue(metadata[activeMarkdownInputField.bindTargetMetadataField]);
			}
		}
	}

	async updateMetaData(key: string, value: any, file: TFile) {
		Logger.logDebug(`updating `, key, `: `, value, ` in '${file.path}'`);

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
		const fileNameIsPath = isPath(name);
		let processedFileName = fileNameIsPath ? removeFileEnding(name) : getFileName(removeFileEnding(name));

		const allFiles = this.app.vault.getFiles();
		const files: TFile[] = [];
		for (const file of allFiles) {
			// console.log(removeFileEnding(file.path));
			if (fileNameIsPath) {
				if (removeFileEnding(file.path) === processedFileName) {
					files.push(file);
				}
			} else {
				if (getFileName(removeFileEnding(file.name)) === processedFileName) {
					files.push(file);
				}
			}
		}

		return files;
	}

	async getMetaDataForFile(file: TFile): Promise<any> {
		// Logger.logDebug(`reading metadata for ${file.path}`);
		let metadata: any;

		let fileContent: string = await this.app.vault.read(file);
		const regExp = new RegExp('^(---)\\n[\\s\\S]*\\n---');
		let frontMatterRegExpResult = regExp.exec(fileContent);
		if (!frontMatterRegExpResult) {
			return {};
		}
		let frontMatter = frontMatterRegExpResult[0];
		if (!frontMatter) {
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
		DateParser.dateFormat = this.settings.dateFormat;
		Logger.devMode = this.settings.devMode;
		await this.saveData(this.settings);
	}
}

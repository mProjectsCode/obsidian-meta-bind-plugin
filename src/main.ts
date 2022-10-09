import {CachedMetadata, FrontMatterCache, parseYaml, Plugin, stringifyYaml, TFile} from 'obsidian';
import {DEFAULT_SETTINGS, MetaBindPluginSettings, MetaBindSettingTab} from './settings/Settings';
import {InputFieldMarkdownRenderChild, InputFieldMarkdownRenderChildType} from './InputFieldMarkdownRenderChild';
import {getFileName, isPath, removeFileEnding} from './utils/Utils';
import {Logger} from './utils/Logger';
import {DateParser} from './parsers/DateParser';
import {InputFieldDeclarationParser} from "./parsers/InputFieldDeclarationParser";

export default class MetaBindPlugin extends Plugin {
	// @ts-ignore defined in `onload`
	settings: MetaBindPluginSettings;

	// @ts-ignore defined in `onload`
	activeMarkdownInputFields: InputFieldMarkdownRenderChild[];
	// @ts-ignore defined in `onload`
	markDownInputFieldIndex: number;

	frontMatterRexExpPattern = '^(---)\\n[\\s\\S]*?\\n---';

	async onload(): Promise<void> {
		await this.loadSettings();

		Logger.devMode = this.settings.devMode;
		DateParser.dateFormat = this.settings.preferredDateFormat;
		InputFieldDeclarationParser.parseTemplates(this.settings.inputTemplates);

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
					context.addChild(new InputFieldMarkdownRenderChild(
						codeBlock,
						InputFieldMarkdownRenderChildType.INLINE_CODE_BLOCK,
						text, this,
						context.sourcePath,
						this.markDownInputFieldIndex,
					));
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
				ctx.addChild(new InputFieldMarkdownRenderChild(
					codeBlock,
					InputFieldMarkdownRenderChildType.CODE_BLOCK,
					text,
					this,
					ctx.sourcePath,
					this.markDownInputFieldIndex));
				this.markDownInputFieldIndex += 1;
			}
		});

		this.app.metadataCache.on('changed', async (file: TFile, data: string, cache: CachedMetadata) => {
			await this.updateMarkdownInputFieldsOnMetadataCacheChange(file, cache);
		});

		this.addSettingTab(new MetaBindSettingTab(this.app, this));
	}

	onunload(): void {
		for (const activeMarkdownInputField of this.activeMarkdownInputFields) {
			activeMarkdownInputField.unload();
		}
	}

	registerInputFieldMarkdownRenderChild(inputFieldMarkdownRenderChild: InputFieldMarkdownRenderChild): void {
		this.activeMarkdownInputFields.push(inputFieldMarkdownRenderChild);
	}

	unregisterInputFieldMarkdownRenderChild(inputFieldMarkdownRenderChild: InputFieldMarkdownRenderChild): void {
		this.activeMarkdownInputFields = this.activeMarkdownInputFields.filter(x => x.uid !== inputFieldMarkdownRenderChild.uid);
	}

	async updateMarkdownInputFieldsOnMetadataCacheChange(file: TFile, cache: CachedMetadata): Promise<void> {
		let metadata: any = undefined;

		for (const activeMarkdownInputField of this.activeMarkdownInputFields) {
			if (!activeMarkdownInputField.inputFieldDeclaration?.isBound || !activeMarkdownInputField.bindTargetFile || !activeMarkdownInputField.bindTargetMetadataField) {
				continue;
			}

			if (activeMarkdownInputField.bindTargetFile.path === file.path) {
				if (metadata === undefined) {
					metadata = await this.getMetadataFromFileCache(cache.frontmatter);
				}
				activeMarkdownInputField.updateValue(metadata[activeMarkdownInputField.bindTargetMetadataField]);
			}
		}
	}

	async updateMetaData(key: string, value: any, file: TFile): Promise<void> {
		Logger.logDebug(`updating `, key, `: `, value, ` in '${file.path}'`);

		if (!file) {
			console.log('no file');
			return;
		}

		let fileContent: string = await this.app.vault.read(file);

		const metadata: any = await this.getMetaDataForFileContent(fileContent);
		// console.log(metadata);
		if (!metadata) {
			return;
		}

		const regExp = new RegExp(this.frontMatterRexExpPattern);
		fileContent = fileContent.replace(regExp, '');

		metadata[key] = value;
		// console.log(metadata);

		fileContent = `---\n${stringifyYaml(metadata)}---` + fileContent;
		await this.app.vault.modify(file, fileContent);
	}

	getFilesByName(name: string): TFile[] {
		// console.log(getFileName(removeFileEnding(name)))
		const fileNameIsPath = isPath(name);
		const processedFileName = fileNameIsPath ? removeFileEnding(name) : getFileName(removeFileEnding(name));

		const allFiles = this.app.vault.getMarkdownFiles();
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
		if (!file) {
			return undefined;
		}

		const fileContent: string = await this.app.vault.read(file);
		return await this.getMetaDataForFileContent(fileContent);
	}

	async getMetaDataForFileContent(fileContent: string): Promise<any> {
		// Logger.logDebug(`reading metadata`);
		let metadata: any;

		const regExp = new RegExp(this.frontMatterRexExpPattern);
		const frontMatterRegExpResult = regExp.exec(fileContent);
		// console.log('regexres: ', frontMatterRegExpResult);
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

		// console.log('metadata: ', metadata);

		return metadata;
	}

	getMetadataFromFileCache(cache: FrontMatterCache | undefined) {
		let metadata = cache as object;

		if (metadata) {
			metadata = Object.assign({}, metadata); // copy
			// @ts-ignore
			delete metadata.position;
		} else {
			metadata = {};
		}
		return metadata;
	}

	async loadSettings(): Promise<void> {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings(): Promise<void> {
		DateParser.dateFormat = this.settings.preferredDateFormat;
		Logger.devMode = this.settings.devMode;
		InputFieldDeclarationParser.parseTemplates(this.settings.inputTemplates);
		await this.saveData(this.settings);
	}
}

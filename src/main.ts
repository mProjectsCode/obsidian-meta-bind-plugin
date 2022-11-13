import { CachedMetadata, FrontMatterCache, parseYaml, Plugin, stringifyYaml, TFile } from 'obsidian';
import { DEFAULT_SETTINGS, MetaBindPluginSettings, MetaBindSettingTab } from './settings/Settings';
import { InputFieldMarkdownRenderChild, InputFieldMarkdownRenderChildType } from './InputFieldMarkdownRenderChild';
import { getFileName, isPath, removeFileEnding } from './utils/Utils';
import { Logger } from './utils/Logger';
import { DateParser } from './parsers/DateParser';
import { InputFieldDeclarationParser } from './parsers/InputFieldDeclarationParser';
import { getFrontmatterOfTFile } from '@opd-libs/opd-metadata-lib/lib/API';

export default class MetaBindPlugin extends Plugin {
	// @ts-ignore defined in `onload`
	settings: MetaBindPluginSettings;

	// @ts-ignore defined in `onload`
	activeMarkdownInputFields: InputFieldMarkdownRenderChild[];
	// @ts-ignore defined in `onload`
	markDownInputFieldIndex: number;

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
					context.addChild(
						new InputFieldMarkdownRenderChild(
							codeBlock,
							InputFieldMarkdownRenderChildType.INLINE_CODE_BLOCK,
							text,
							this,
							context.sourcePath,
							this.markDownInputFieldIndex
						)
					);
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

		this.registerEvent(
			this.app.metadataCache.on('changed', async (file: TFile, data: string, cache: CachedMetadata) => {
				await this.updateMarkdownInputFieldsOnMetadataCacheChange(file, cache);
			})
		);

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

	updateMarkdownInputFieldsOnMetadataCacheChange(file: TFile, cache: CachedMetadata): void {
		let metadata: any = undefined;

		for (const activeMarkdownInputField of this.activeMarkdownInputFields) {
			if (!activeMarkdownInputField.inputFieldDeclaration?.isBound || !activeMarkdownInputField.bindTargetFile || !activeMarkdownInputField.bindTargetMetadataField) {
				continue;
			}

			if (activeMarkdownInputField.bindTargetFile.path === file.path) {
				if (metadata === undefined) {
					metadata = getFrontmatterOfTFile(file, this);
				}
				activeMarkdownInputField.pushToInputFieldValueUpdateQueue(metadata[activeMarkdownInputField.bindTargetMetadataField]);
			}
		}
	}

	getFilesByName(name: string): TFile[] {
		console.log(getFileName(removeFileEnding(name)));
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

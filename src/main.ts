import { Plugin, TFile } from 'obsidian';
import { DEFAULT_SETTINGS, MetaBindPluginSettings, MetaBindSettingTab } from './settings/Settings';
import { InputFieldMarkdownRenderChild, InputFieldMarkdownRenderChildType } from './InputFieldMarkdownRenderChild';
import { getFileName, isPath, removeFileEnding } from './utils/Utils';
import { DateParser } from './parsers/DateParser';
import { InputFieldDeclarationParser } from './parsers/InputFieldDeclarationParser';
import { MetadataManager } from './MetadataManager';

export default class MetaBindPlugin extends Plugin {
	// @ts-ignore defined in `onload`
	settings: MetaBindPluginSettings;

	// @ts-ignore defined in `onload`
	activeMarkdownInputFields: InputFieldMarkdownRenderChild[];

	// @ts-ignore defined in `onload`
	metadataManager: MetadataManager;

	async onload(): Promise<void> {
		await this.loadSettings();

		DateParser.dateFormat = this.settings.preferredDateFormat;
		InputFieldDeclarationParser.parseTemplates(this.settings.inputTemplates);

		this.activeMarkdownInputFields = [];
		this.metadataManager = new MetadataManager(this);

		this.registerMarkdownPostProcessor((element, context) => {
			const codeBlocks = element.querySelectorAll('code');
			for (let index = 0; index < codeBlocks.length; index++) {
				const codeBlock = codeBlocks.item(index);
				const text = codeBlock.innerText;
				const isInputField = text.startsWith('INPUT[') && text.endsWith(']');
				// console.log(context.sourcePath);
				if (isInputField) {
					context.addChild(
						new InputFieldMarkdownRenderChild(codeBlock, InputFieldMarkdownRenderChildType.INLINE_CODE_BLOCK, text, this, context.sourcePath, crypto.randomUUID())
					);
				}
			}
		}, 100);

		this.registerMarkdownCodeBlockProcessor('meta-bind', (source, el, ctx) => {
			const codeBlock = el;
			const text = source.replace(/\n/g, '');
			const isInputField = text.startsWith('INPUT[') && text.endsWith(']');
			// console.log(context.sourcePath);
			if (isInputField) {
				ctx.addChild(new InputFieldMarkdownRenderChild(codeBlock, InputFieldMarkdownRenderChildType.CODE_BLOCK, text, this, ctx.sourcePath, crypto.randomUUID()));
			}
		});

		this.addSettingTab(new MetaBindSettingTab(this.app, this));
	}

	onunload(): void {
		for (const activeMarkdownInputField of this.activeMarkdownInputFields) {
			activeMarkdownInputField.unload();
		}
	}

	registerInputFieldMarkdownRenderChild(inputFieldMarkdownRenderChild: InputFieldMarkdownRenderChild): void {
		console.debug(`meta-bind | registered input field ${inputFieldMarkdownRenderChild.uuid}`);
		this.activeMarkdownInputFields.push(inputFieldMarkdownRenderChild);
	}

	unregisterInputFieldMarkdownRenderChild(inputFieldMarkdownRenderChild: InputFieldMarkdownRenderChild): void {
		console.debug(`meta-bind | unregistered input field ${inputFieldMarkdownRenderChild.uuid}`);
		this.activeMarkdownInputFields = this.activeMarkdownInputFields.filter(x => x.uuid !== inputFieldMarkdownRenderChild.uuid);
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
		InputFieldDeclarationParser.parseTemplates(this.settings.inputTemplates);
		await this.saveData(this.settings);
	}
}

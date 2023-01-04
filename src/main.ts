import { Plugin, TFile } from 'obsidian';
import { DEFAULT_SETTINGS, MetaBindPluginSettings, MetaBindSettingTab } from './settings/Settings';
import { InputFieldMarkdownRenderChild, RenderChildType } from './InputFieldMarkdownRenderChild';
import { getFileName, isPath, removeFileEnding } from './utils/Utils';
import { DateParser } from './parsers/DateParser';
import { InputFieldArgumentType, InputFieldDeclaration, InputFieldDeclarationParser, InputFieldType } from './parsers/InputFieldDeclarationParser';
import { MetadataManager } from './MetadataManager';
import { MetaBindBindTargetError } from './utils/MetaBindErrors';
import { API } from './API';
import { ScriptMarkdownRenderChild } from './ScriptMarkdownRenderChild';
import { plugins } from 'pretty-format';
import { Extension } from '@codemirror/state';
import { cmPlugin } from './frontmatterDisplay/CmPlugin';
import { setFirstWeekday } from './inputFields/DatePicker/DatePickerInputSvelteHelpers';

export default class MetaBindPlugin extends Plugin {
	// @ts-ignore defined in `onload`
	settings: MetaBindPluginSettings;

	// @ts-ignore defined in `onload`
	activeMarkdownInputFields: InputFieldMarkdownRenderChild[];

	// @ts-ignore defined in `onload`
	metadataManager: MetadataManager;

	// @ts-ignore defined in `onload`
	api: API;

	// @ts-ignore defined in `onload`
	editorExtensions: Extension[];

	async onload(): Promise<void> {
		console.log(`meta-bind | Main >> load`);

		await this.loadSettings();

		this.api = new API(this);

		DateParser.dateFormat = this.settings.preferredDateFormat;
		this.api.parser.parseTemplates(this.settings.inputTemplates);
		setFirstWeekday(this.settings.firstWeekday);

		this.activeMarkdownInputFields = [];
		this.metadataManager = new MetadataManager(this);

		this.registerMarkdownPostProcessor((el, ctx) => {
			const codeBlocks = el.querySelectorAll('code');
			for (let index = 0; index < codeBlocks.length; index++) {
				const codeBlock = codeBlocks.item(index);
				const content = codeBlock.innerText;
				const isInputField = content.startsWith('INPUT[') && content.endsWith(']');
				if (isInputField) {
					const inputField = this.api.createInputFieldFromString(content, RenderChildType.INLINE, ctx.sourcePath, codeBlock);
					ctx.addChild(inputField);
				}
			}
		}, 100);

		this.registerMarkdownCodeBlockProcessor('meta-bind', (source, el, ctx) => {
			const codeBlock = el;
			const content = source.replace(/\n/g, '');
			const isInputField = content.startsWith('INPUT[') && content.endsWith(']');
			if (isInputField) {
				const inputField = this.api.createInputFieldFromString(content, RenderChildType.BLOCK, ctx.sourcePath, codeBlock);
				ctx.addChild(inputField);
			}
		});

		this.registerMarkdownCodeBlockProcessor('meta-bind-js', (source, el, ctx) => {
			ctx.addChild(new ScriptMarkdownRenderChild(el, source, ctx, this));
		});

		// this.registerEditorExtension(cmPlugin);

		this.addSettingTab(new MetaBindSettingTab(this.app, this));
	}

	onunload(): void {
		console.log(`meta-bind | Main >> unload`);
		for (const activeMarkdownInputField of this.activeMarkdownInputFields) {
			activeMarkdownInputField.unload();
		}
	}

	registerInputFieldMarkdownRenderChild(inputFieldMarkdownRenderChild: InputFieldMarkdownRenderChild): void {
		console.debug(`meta-bind | Main >> registered input field ${inputFieldMarkdownRenderChild.uuid}`);
		this.activeMarkdownInputFields.push(inputFieldMarkdownRenderChild);
	}

	unregisterInputFieldMarkdownRenderChild(inputFieldMarkdownRenderChild: InputFieldMarkdownRenderChild): void {
		console.debug(`meta-bind | Main >> unregistered input field ${inputFieldMarkdownRenderChild.uuid}`);
		this.activeMarkdownInputFields = this.activeMarkdownInputFields.filter(x => x.uuid !== inputFieldMarkdownRenderChild.uuid);
	}

	getFilesByName(name: string): TFile[] {
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
		console.log(`meta-bind | Main >> settings load`);

		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings(): Promise<void> {
		console.log(`meta-bind | Main >> settings save`);

		DateParser.dateFormat = this.settings.preferredDateFormat;
		this.api.parser.parseTemplates(this.settings.inputTemplates);
		setFirstWeekday(this.settings.firstWeekday);
		await this.saveData(this.settings);
	}
}

import { Plugin } from 'obsidian';
import { DEFAULT_SETTINGS, MetaBindPluginSettings, MetaBindSettingTab } from './settings/Settings';
import { RenderChildType } from './renderChildren/InputFieldMDRC';
import { getFileName, isPath, removeFileEnding } from './utils/Utils';
import { DateParser } from './parsers/DateParser';
import { MetadataManager } from './metadata/MetadataManager';
import { API } from './api/API';
import { setFirstWeekday } from './inputFields/DatePicker/DatePickerInputSvelteHelpers';
import './frontmatterDisplay/custom_overlay';
import { Mode } from 'codemirror';
import { createMarkdownRenderChildWidgetEditorPlugin } from './cm6/Cm6_ViewPlugin';
import { AbstractPlugin } from './AbstractPlugin';
import { MDRCManager } from './MDRCManager';

export default class MetaBindPlugin extends Plugin implements AbstractPlugin {
	// @ts-ignore defined in `onload`
	settings: MetaBindPluginSettings;

	// @ts-ignore defined in `onload`
	mdrcManager: MDRCManager;

	// @ts-ignore defined in `onload`
	metadataManager: MetadataManager;

	// @ts-ignore defined in `onload`
	api: API;

	async onload(): Promise<void> {
		console.log(`meta-bind | Main >> load`);

		await this.loadSettings();

		this.api = new API(this);

		DateParser.dateFormat = this.settings.preferredDateFormat;
		this.api.inputFieldParser.parseTemplates(this.settings.inputTemplates);
		setFirstWeekday(this.settings.firstWeekday);

		this.mdrcManager = new MDRCManager();
		this.metadataManager = new MetadataManager(this);

		this.registerMarkdownPostProcessor((el, ctx) => {
			const codeBlocks = el.querySelectorAll('code');
			for (let index = 0; index < codeBlocks.length; index++) {
				const codeBlock = codeBlocks.item(index);
				const content = codeBlock.innerText;
				const isInputField = content.startsWith('INPUT[') && content.endsWith(']');
				const isViewField = content.startsWith('VIEW[') && content.endsWith(']');
				if (isInputField) {
					const inputField = this.api.createInputFieldFromString(content, RenderChildType.INLINE, ctx.sourcePath, codeBlock);
					ctx.addChild(inputField);
				}
				if (isViewField) {
					const viewField = this.api.createViewFieldFromString(content, RenderChildType.INLINE, ctx.sourcePath, codeBlock);
					ctx.addChild(viewField);
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

		this.registerMarkdownCodeBlockProcessor('meta-bind-js-view', (source, el, ctx) => {
			const inputField = this.api.createJsViewFieldFromString(source, RenderChildType.BLOCK, ctx.sourcePath, el);
			ctx.addChild(inputField);
		});

		// this.registerMarkdownCodeBlockProcessor('meta-bind-js', (source, el, ctx) => {
		// 	ctx.addChild(new ScriptMarkdownRenderChild(el, source, ctx, this));
		// });

		this.registerEditorExtension(createMarkdownRenderChildWidgetEditorPlugin(this));
		// const languageCompartment = new Compartment();
		// this.registerEditorExtension(languageCompartment.of(javascript()));

		// this.addCommand({
		// 	id: 'mb-test-command',
		// 	name: 'test command',
		// 	editorCallback: (editor: Editor, view: MarkdownView | MarkdownFileInfo) => {
		// 		console.log(editor);
		// 	},
		// });

		// if (this.settings.devMode) {
		// 	this.addCommand({
		// 		id: 'meta-bind-debug',
		// 		name: 'Trip Debugger',
		// 		callback: () => {
		// 			debugger;
		// 		},
		// 	});
		// }
		//
		// this.app.workspace.onLayoutReady(async () => {
		// 	await this.registerCodeMirrorMode();
		// });

		this.addSettingTab(new MetaBindSettingTab(this.app, this));
	}

	/**
	 * Inspired by https://github.com/SilentVoid13/Templater/blob/487805b5ad1fd7fbc145040ed82b4c41fc2c48e2/src/editor/Editor.ts#L67
	 */
	async registerCodeMirrorMode(): Promise<void> {
		const js_mode: Mode<any> = window.CodeMirror.getMode({}, 'javascript');
		if (js_mode == null || js_mode.name === 'null') {
			console.log("Couldn't find js mode, can't enable syntax highlighting.");
			return;
		}

		// if templater enabled, this only runs on the code blocks, otherwise this runs on the whole document

		window.CodeMirror.defineMode('meta-bind-js', config => {
			const mbOverlay: any = {
				startState: () => {
					const js_state = window.CodeMirror.startState(js_mode);
					return {
						...js_state,
					};
				},
				blankLine: (state: any) => {
					return null;
				},
				copyState: (state: any) => {
					const js_state = window.CodeMirror.startState(js_mode);
					return {
						...js_state,
					};
				},
				token: (stream: any, state: any) => {
					// const globals = ['app', 'mb', 'dv', 'filePath', 'ctx'];

					// console.log(stream);

					// for (const global of globals) {
					// 	if (stream.match(global)) {
					// 		return 'variable';
					// 	}
					// }

					const js_result = js_mode.token && js_mode.token(stream, state);
					return `line-HyperMD-codeblock ${js_result}`;
				},
			};

			return mbOverlay;
		});
	}

	onunload(): void {
		console.log(`meta-bind | Main >> unload`);
		this.mdrcManager.unload();
	}

	getFilePathsByName(name: string): string[] {
		const fileNameIsPath = isPath(name);
		const processedFileName = fileNameIsPath ? removeFileEnding(name) : getFileName(removeFileEnding(name));

		const allFiles = this.app.vault.getMarkdownFiles();
		const filePaths: string[] = [];
		for (const file of allFiles) {
			// console.log(removeFileEnding(file.path));
			if (fileNameIsPath) {
				if (removeFileEnding(file.path) === processedFileName) {
					filePaths.push(file.path);
				}
			} else {
				if (getFileName(removeFileEnding(file.name)) === processedFileName) {
					filePaths.push(file.path);
				}
			}
		}

		return filePaths;
	}

	async loadSettings(): Promise<void> {
		console.log(`meta-bind | Main >> settings load`);

		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings(): Promise<void> {
		console.log(`meta-bind | Main >> settings save`);

		DateParser.dateFormat = this.settings.preferredDateFormat;
		this.api.inputFieldParser.parseTemplates(this.settings.inputTemplates);
		setFirstWeekday(this.settings.firstWeekday);
		await this.saveData(this.settings);
	}
}

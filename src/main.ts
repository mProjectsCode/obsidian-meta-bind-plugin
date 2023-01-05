import { Plugin, TFile } from 'obsidian';
import { DEFAULT_SETTINGS, MetaBindPluginSettings, MetaBindSettingTab } from './settings/Settings';
import { InputFieldMarkdownRenderChild, RenderChildType } from './InputFieldMarkdownRenderChild';
import { getFileName, isPath, removeFileEnding } from './utils/Utils';
import { DateParser } from './parsers/DateParser';
import { MetadataManager } from './MetadataManager';
import { API } from './API';
import { ScriptMarkdownRenderChild } from './ScriptMarkdownRenderChild';
import { Extension } from '@codemirror/state';
import { setFirstWeekday } from './inputFields/DatePicker/DatePickerInputSvelteHelpers';
import { StreamLanguage, StreamParser } from '@codemirror/language';
import './frontmatterDisplay/custom_overlay';
import { Mode } from 'codemirror';

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
		// const languageCompartment = new Compartment();
		// this.registerEditorExtension(languageCompartment.of(javascript()));

		// this.addCommand({
		// 	id: 'mb-test-command',
		// 	name: 'test command',
		// 	editorCallback: (editor: Editor, view: MarkdownView | MarkdownFileInfo) => {
		// 		console.log(editor);
		// 	},
		// });

		if (this.settings.devMode) {
			this.addCommand({
				id: 'meta-bind-debug',
				name: 'Trip Debugger',
				callback: () => {
					debugger;
				},
			});
		}

		this.app.workspace.onLayoutReady(async () => {
			await this.registerCodeMirrorMode();
			const mode = window.CodeMirror.getMode({}, { name: 'meta-bind-js' });
			this.registerEditorExtension(StreamLanguage.define(mode as any));
		});

		this.addSettingTab(new MetaBindSettingTab(this.app, this));
	}

	/**
	 * Inspired by https://github.com/SilentVoid13/Templater/blob/487805b5ad1fd7fbc145040ed82b4c41fc2c48e2/src/editor/Editor.ts#L67
	 */
	async registerCodeMirrorMode(): Promise<void> {
		let js_mode: Mode<any> = window.CodeMirror.getMode({}, 'javascript');
		if (js_mode == null || js_mode.name === 'null') {
			console.log("Couldn't find js mode, can't enable syntax highlighting.");
			return;
		}

		console.log(js_mode);

		// Custom overlay mode used to handle edge cases
		// @ts-ignore
		const overlay_mode = window.CodeMirror.customOverlayMode;
		if (overlay_mode == null) {
			console.log("Couldn't find customOverlayMode, can't enable syntax highlighting.");
			return;
		}

		// if templater enabled, this only runs on the code blocks, otherwise this runs on the whole document

		window.CodeMirror.defineMode('meta-bind-js', function (config) {
			const mbOverlay: any = {
				startState: () => {
					const js_state = window.CodeMirror.startState(js_mode);
					return {
						...js_state,
						inMBScriptCodeBlock: false,
					};
				},
				blankLine: (state: any) => {
					console.log(state, 'blank');
					return null;
				},
				copyState: (state: any) => {
					const js_state = window.CodeMirror.startState(js_mode);
					return {
						...js_state,
						inMBScriptCodeBlock: state.inMBScriptCodeBlock,
					};
				},
				token: (stream: any, state: any) => {
					const globals = ['app', 'mb', 'dv', 'filePath', 'ctx'];

					console.log(stream);

					if (state.inMBScriptCodeBlock) {
						if (stream.match(/```/, true)) {
							state.inMBScriptCodeBlock = false;
						} else {
							for (const global of globals) {
								if (stream.match(global)) {
									return 'atom';
								}
							}

							const js_result = js_mode.token && js_mode.token(stream, state);
							return `line-HyperMD-codeblock ${js_result}`;
						}
					}

					const match = stream.match(/```meta-bind-js/, true);
					console.log(match);
					if (match != null) {
						state.inMBScriptCodeBlock = true;
					}

					while (stream.next() != null && !stream.match(/```meta-bind-js/, false));
					return null;
				},
			};

			return overlay_mode(window.CodeMirror.getMode(config, 'hypermd'), mbOverlay);
		});
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

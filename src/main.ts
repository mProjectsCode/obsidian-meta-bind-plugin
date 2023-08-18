import { Editor, MarkdownFileInfo, MarkdownPostProcessorContext, MarkdownView, Plugin } from 'obsidian';
import { MetaBindSettingTab } from './settings/SettingsTab';
import { RenderChildType } from './renderChildren/InputFieldMDRC';
import { getFileName, isPath, removeFileEnding } from './utils/Utils';
import { DateParser } from './parsers/DateParser';
import { MetadataManager } from './metadata/MetadataManager';
import { API } from './api/API';
import { setFirstWeekday } from './inputFields/fields/DatePicker/DatePickerInputSvelteHelpers';
import './frontmatterDisplay/custom_overlay';
import { Mode } from 'codemirror';
import { createMarkdownRenderChildWidgetEditorPlugin } from './cm6/Cm6_ViewPlugin';
import { MDRCManager } from './MDRCManager';
import { DEFAULT_SETTINGS, InputFieldTemplate, MetaBindPluginSettings } from './settings/Settings';
import { IPlugin } from './IPlugin';
import { ParserTestMDRC } from './renderChildren/ParserTestMDRC';
import { EnclosingPair, ParserUtils } from './utils/ParserUtils';
import { ErrorLevel, MetaBindParsingError } from './utils/errors/MetaBindErrors';

export default class MetaBindPlugin extends Plugin implements IPlugin {
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
		await this.saveSettings();

		this.api = new API(this);

		const templateParseErrorCollection = this.api.newInputFieldParser.parseTemplates(this.settings.inputFieldTemplates);
		if (templateParseErrorCollection.hasErrors()) {
			console.warn('meta-bind | failed to parse templates', templateParseErrorCollection);
		}

		this.mdrcManager = new MDRCManager();
		this.metadataManager = new MetadataManager(this);

		this.registerMarkdownPostProcessor((el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
			const codeBlocks = el.querySelectorAll('code');

			// console.log(el.outerHTML);

			for (let index = 0; index < codeBlocks.length; index++) {
				const codeBlock = codeBlocks.item(index);

				// console.log(codeBlock.outerHTML);
				// console.log(codeBlock.tagName, codeBlock.className, codeBlock.innerText);

				if (codeBlock.hasClass('meta-bind-none')) {
					continue;
				}

				const content = codeBlock.innerText;
				const isInputField = content.startsWith('INPUT[') && content.endsWith(']');
				const isViewField = content.startsWith('VIEW[') && content.endsWith(']');
				if (isInputField) {
					const inputField = this.api.createInputFieldFromString(content, RenderChildType.INLINE, ctx.sourcePath, codeBlock, ctx);
					ctx.addChild(inputField);
				}
				if (isViewField) {
					const viewField = this.api.createViewFieldFromString(content, RenderChildType.INLINE, ctx.sourcePath, codeBlock, ctx);
					ctx.addChild(viewField);
				}
			}
		}, 100);

		this.registerMarkdownCodeBlockProcessor('meta-bind', (source, el, ctx) => {
			const codeBlock = el;
			const content = source.replaceAll('\n', '').trim();
			const isInputField = content.startsWith('INPUT[') && content.endsWith(']');
			if (isInputField) {
				const inputField = this.api.createInputFieldFromString(content, RenderChildType.BLOCK, ctx.sourcePath, codeBlock, ctx);
				ctx.addChild(inputField);
			}
		});

		this.registerMarkdownCodeBlockProcessor('meta-bind-js-view', (source, el, ctx) => {
			const inputField = this.api.createJsViewFieldFromString(source, RenderChildType.BLOCK, ctx.sourcePath, el, ctx);
			ctx.addChild(inputField);
		});

		this.registerMarkdownCodeBlockProcessor('meta-bind-parser-test', (source, el, ctx) => {
			ctx.addChild(new ParserTestMDRC(el, RenderChildType.BLOCK, this, ctx.sourcePath, self.crypto.randomUUID(), {}));
		});

		// this.registerMarkdownCodeBlockProcessor('meta-bind-js', (source, el, ctx) => {
		// 	ctx.addChild(new ScriptMarkdownRenderChild(el, source, ctx, this));
		// });

		this.registerEditorExtension(createMarkdownRenderChildWidgetEditorPlugin(this));
		// const languageCompartment = new Compartment();
		// this.registerEditorExtension(languageCompartment.of(javascript()));

		this.addCommand({
			id: 'mb-debugger-command',
			name: 'debugger',
			callback: () => {
				debugger;
			},
		});

		this.addCommand({
			id: 'mb-test-command',
			name: 'test command',
			editorCallback: (editor: Editor, view: MarkdownView | MarkdownFileInfo) => {
				if (view.file) {
					this.app.fileManager.processFrontMatter(view.file, frontmatter => {
						return frontmatter;
					});
				}
			},
		});

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

		let loadedSettings = await this.loadData();

		loadedSettings = this.applyTemplatesMigration(loadedSettings);

		this.settings = Object.assign({}, DEFAULT_SETTINGS, loadedSettings);
	}

	async saveSettings(): Promise<void> {
		console.log(`meta-bind | Main >> settings save`);

		DateParser.dateFormat = this.settings.preferredDateFormat;
		// this.api.inputFieldParser.parseTemplates(this.settings.inputTemplates);
		setFirstWeekday(this.settings.firstWeekday);
		await this.saveData(this.settings);
	}

	applyTemplatesMigration(oldSettings: any): any {
		if (oldSettings.inputTemplates !== undefined) {
			const templates = oldSettings.inputTemplates;
			const newTemplates: InputFieldTemplate[] = [];

			try {
				let templateDeclarations = templates ? ParserUtils.split(templates, '\n', new EnclosingPair('[', ']')) : [];
				templateDeclarations = templateDeclarations.map(x => x.trim()).filter(x => x.length > 0);

				for (const templateDeclaration of templateDeclarations) {
					let templateDeclarationParts: string[] = ParserUtils.split(templateDeclaration, '->', new EnclosingPair('[', ']'));
					templateDeclarationParts = templateDeclarationParts.map(x => x.trim());

					if (templateDeclarationParts.length === 1) {
						throw new MetaBindParsingError(ErrorLevel.CRITICAL, 'failed to parse template declaration', `template must include one "->"`);
					} else if (templateDeclarationParts.length === 2) {
						newTemplates.push({
							name: templateDeclarationParts[0],
							declaration: templateDeclarationParts[1],
						});
					}
				}
			} catch (e) {
				console.warn('failed to migrate templates', e);
			}

			delete oldSettings.inputTemplates;
			oldSettings.inputFieldTemplates = newTemplates;
		}

		return oldSettings;
	}
}

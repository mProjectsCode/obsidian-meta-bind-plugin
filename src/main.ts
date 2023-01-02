import { Plugin, TFile } from 'obsidian';
import { DEFAULT_SETTINGS, MetaBindPluginSettings, MetaBindSettingTab } from './settings/Settings';
import { InputFieldMarkdownRenderChild, InputFieldMarkdownRenderChildType } from './InputFieldMarkdownRenderChild';
import { getFileName, isPath, removeFileEnding } from './utils/Utils';
import { DateParser } from './parsers/DateParser';
import { InputFieldArgumentType, InputFieldDeclaration, InputFieldDeclarationParser, InputFieldType } from './parsers/InputFieldDeclarationParser';
import { MetadataManager } from './MetadataManager';
import { MetaBindBindTargetError } from './utils/MetaBindErrors';
import { API } from './API';

export default class MetaBindPlugin extends Plugin {
	// @ts-ignore defined in `onload`
	settings: MetaBindPluginSettings;

	// @ts-ignore defined in `onload`
	activeMarkdownInputFields: InputFieldMarkdownRenderChild[];

	// @ts-ignore defined in `onload`
	metadataManager: MetadataManager;

	// @ts-ignore defined in `onload`
	api: API;

	async onload(): Promise<void> {
		console.log(`meta-bind | Main >> load`);

		await this.loadSettings();

		this.api = new API(this);

		DateParser.dateFormat = this.settings.preferredDateFormat;
		this.api.parser.parseTemplates(this.settings.inputTemplates);

		this.activeMarkdownInputFields = [];
		this.metadataManager = new MetadataManager(this);

		this.registerMarkdownPostProcessor((el, ctx) => {
			const codeBlocks = el.querySelectorAll('code');
			for (let index = 0; index < codeBlocks.length; index++) {
				const codeBlock = codeBlocks.item(index);
				const content = codeBlock.innerText;
				const isInputField = content.startsWith('INPUT[') && content.endsWith(']');
				if (isInputField) {
					const inputField = this.api.createInputFieldFromString(content, InputFieldMarkdownRenderChildType.INLINE_CODE_BLOCK, ctx.sourcePath, codeBlock);
					ctx.addChild(inputField);
				}
			}
		}, 100);

		this.registerMarkdownCodeBlockProcessor('meta-bind', (source, el, ctx) => {
			const codeBlock = el;
			const content = source.replace(/\n/g, '');
			const isInputField = content.startsWith('INPUT[') && content.endsWith(']');
			if (isInputField) {
				const inputField = this.api.createInputFieldFromString(content, InputFieldMarkdownRenderChildType.CODE_BLOCK, ctx.sourcePath, codeBlock);
				ctx.addChild(inputField);
			}
		});

		this.addSettingTab(new MetaBindSettingTab(this.app, this));
	}

	/**
	 * Accessible function for building an input field.
	 *
	 * @param {string|InputFieldDeclaration} declaration The input field declaration as a string or object.
	 * @param {string} sourcePath The path of the file the element will be inserted into.
	 * @param {HTMLElement} container The container element for the input element.
	 * @param {InputFieldMarkdownRenderChildType} renderType Inline or Code Block.
	 *
	 * @returns The render child produced.
	 */
	// buildInputFieldMarkdownRenderChild(
	// 	declaration: string | InputFieldDeclaration,
	// 	sourcePath: string,
	// 	container: HTMLElement,
	// 	renderType: InputFieldMarkdownRenderChildType = InputFieldMarkdownRenderChildType.INLINE_CODE_BLOCK
	// ): InputFieldMarkdownRenderChild {
	// 	if (typeof declaration === 'string') {
	// 		declaration = InputFieldDeclarationParser.parseString(declaration);
	// 	} else {
	// 		declaration = InputFieldDeclarationParser.parseDeclaration(declaration);
	// 	}
	//
	// 	return new InputFieldMarkdownRenderChild(container, renderType, declaration, this, sourcePath, crypto.randomUUID());
	// }

	/**
	 * Helper method to build a declaration from some initial data or a string.
	 *
	 * @param {string | InputFieldDeclaration | {}} declarationData The base declaration data or a string to parse for it. Can also be an empty object with the other arguments provided to fill it.
	 * @param {Record<InputFieldArgumentType, string> | {} | undefined} inputFieldArguments (Optional) The input field arguments, indexed by argument name.
	 * @param {InputFieldType | undefined} inputFieldType (Optional) The input field type if not provided in the base object.
	 * @param {boolean | undefined} isBound (Optional) If the field should try to be bound to a bindTarget.
	 * @param {string | undefined} bindTarget (Optional) The bind target of the field.
	 * @param {string | undefined} templateName (Optional) A template to use.
	 *
	 * @returns A constructed InputFieldDeclaration.
	 */
	// buildDeclaration(
	// 	declarationData: string | InputFieldDeclaration | {},
	// 	inputFieldArguments?: Record<InputFieldArgumentType, string> | {},
	// 	inputFieldType?: InputFieldType,
	// 	isBound?: boolean,
	// 	bindTarget?: string,
	// 	templateName?: string
	// ): InputFieldDeclaration {
	// 	if (typeof declarationData === 'string') {
	// 		return InputFieldDeclarationParser.parseString(declarationData);
	// 	} else {
	// 		const declarationBase = declarationData as InputFieldDeclaration;
	// 		declarationBase.inputFieldType = inputFieldType ?? declarationBase.inputFieldType ?? InputFieldType.INVALID;
	// 		declarationBase.isBound = isBound ?? declarationBase.isBound ?? false;
	// 		declarationBase.bindTarget = bindTarget ?? declarationBase.bindTarget ?? undefined;
	//
	// 		// if the input field is bound should be determined by `isBound`
	// 		// `isBound` is true, `bindTarget` must be set
	// 		if (declarationBase.isBound && !declarationBase.bindTarget) {
	// 			throw new MetaBindBindTargetError('input field declaration is bound but bind target is undefined');
	// 		}
	//
	// 		return InputFieldDeclarationParser.parseDeclaration(declarationBase, inputFieldArguments, templateName);
	// 	}
	// }

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
		await this.saveData(this.settings);
	}
}

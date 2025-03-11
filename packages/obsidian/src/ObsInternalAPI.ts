import type { App } from 'obsidian';
import { Component, MarkdownRenderer, Notice, parseYaml, setIcon, stringifyYaml, TFile, TFolder } from 'obsidian';
import type { LifecycleHook } from 'packages/core/src/api/API';
import type { Command, ModalOptions } from 'packages/core/src/api/InternalAPI';
import { InternalAPI } from 'packages/core/src/api/InternalAPI';
import type {
	ImageSuggesterLikeIPF,
	SuggesterLikeIFP,
	SuggesterOption,
} from 'packages/core/src/fields/inputFields/fields/Suggester/SuggesterHelper';
import type { ModalContent } from 'packages/core/src/modals/ModalContent';
import type { SelectModalContent } from 'packages/core/src/modals/SelectModalContent';
import type { ContextMenuItemDefinition, IContextMenu } from 'packages/core/src/utils/IContextMenu';
import type { IFuzzySearch } from 'packages/core/src/utils/IFuzzySearch';
import type { IJsRenderer } from 'packages/core/src/utils/IJsRenderer';
import type { MBLiteral } from 'packages/core/src/utils/Literal';
import { FuzzySearch } from 'packages/obsidian/src/FuzzySearch';
import type { ObsMetaBind } from 'packages/obsidian/src/main';
import { getImageSuggesterOptionsForInputField } from 'packages/obsidian/src/modals/ImageSuggesterModalHelper';
import { ObsModal } from 'packages/obsidian/src/modals/ObsModal';
import { ObsSearchModal } from 'packages/obsidian/src/modals/ObsSearchModal';
import { getSuggesterOptionsForInputField } from 'packages/obsidian/src/modals/SuggesterModalHelper';
import { ObsContextMenu } from 'packages/obsidian/src/ObsContextMenu';
import { ObsJsRenderer } from 'packages/obsidian/src/ObsJsRenderer';
import { getJsEnginePluginAPI, getTemplaterPluginAPI, Templater_RunMode } from 'packages/obsidian/src/ObsUtils';
import type { ZodType } from 'zod';
import { z } from 'zod';

export class ObsInternalAPI extends InternalAPI<ObsMetaBind> {
	// This is needed to access the plugin instance with the correct type.
	private readonly omb: ObsMetaBind;
	private readonly app: App;

	constructor(mb: ObsMetaBind) {
		super(mb);

		this.omb = mb;
		this.app = mb.app;
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public getLifecycleHookValidator(): ZodType<LifecycleHook, any, any> {
		return z.instanceof(Component);
	}

	public getImageSuggesterOptions(inputField: ImageSuggesterLikeIPF): SuggesterOption<string>[] {
		return getImageSuggesterOptionsForInputField(this.omb, inputField);
	}

	public getSuggesterOptions(inputField: SuggesterLikeIFP): SuggesterOption<MBLiteral>[] {
		return getSuggesterOptionsForInputField(this.omb, inputField);
	}

	public async renderMarkdown(markdown: string, element: HTMLElement, filePath: string): Promise<() => void> {
		const component = new Component();
		component.load();
		await MarkdownRenderer.render(this.app, markdown, element, filePath, component);
		return () => component.unload();
	}

	public executeCommandById(id: string): boolean {
		return this.app.commands.executeCommandById(id);
	}

	public isJsEngineAvailable(): boolean {
		try {
			getJsEnginePluginAPI(this.omb);
			return true;
		} catch (_e) {
			return false;
		}
	}

	public async jsEngineRunFile(
		filePath: string,
		callingFilePath: string,
		contextOverrides: Record<string, unknown>,
		container?: HTMLElement,
	): Promise<() => void> {
		const jsEngineAPI = getJsEnginePluginAPI(this.omb);

		const context = await jsEngineAPI.internal.getContextForMarkdownCallingJSFile(callingFilePath, filePath);

		const component = new Component();
		await jsEngineAPI.internal.executeFile(filePath, {
			component: component,
			container: container,
			context: context,
			contextOverrides: contextOverrides,
		});

		return () => component.unload();
	}

	public async jsEngineRunCode(
		code: string,
		callingFilePath: string,
		contextOverrides: Record<string, unknown>,
		container?: HTMLElement,
	): Promise<() => void> {
		const jsEngineAPI = getJsEnginePluginAPI(this.omb);

		const context = await jsEngineAPI.internal.getContextForMarkdownOther(callingFilePath);

		const component = new Component();
		await jsEngineAPI.internal.execute({
			code: code,
			component: component,
			container: container,
			context: context,
			contextOverrides: contextOverrides,
		});

		return () => component.unload();
	}

	public createJsRenderer(container: HTMLElement, filePath: string, code: string, hidden: boolean): IJsRenderer {
		return new ObsJsRenderer(this.omb, container, filePath, code, hidden);
	}

	public showNotice(message: string): void {
		new Notice(message);
	}

	public parseYaml(yaml: string): unknown {
		return parseYaml(yaml);
	}

	public stringifyYaml(yaml: unknown): string {
		return stringifyYaml(yaml);
	}

	public setIcon(element: HTMLElement, icon: string): void {
		setIcon(element, icon);
	}

	public imagePathToUri(imagePath: string): string {
		return this.app.vault.adapter.getResourcePath(imagePath);
	}

	public createModal(content: ModalContent, options: ModalOptions): ObsModal {
		return new ObsModal(this.omb, content, options);
	}

	public createSearchModal<T>(content: SelectModalContent<T>): ObsSearchModal<T> {
		return new ObsSearchModal(this.omb, content);
	}

	public getAllCommands(): Command[] {
		return this.app.commands.listCommands().map(command => ({
			id: command.id,
			name: command.name,
		}));
	}

	public createFuzzySearch(): IFuzzySearch {
		return new FuzzySearch();
	}

	public createContextMenu(items: ContextMenuItemDefinition[]): IContextMenu {
		const menu = new ObsContextMenu();
		menu.setItems(items);
		return menu;
	}

	public async evaluateTemplaterTemplate(templateFilePath: string, targetFilePath: string): Promise<string> {
		const templaterAPI = getTemplaterPluginAPI(this.omb);

		const templateFile = this.app.vault.getAbstractFileByPath(templateFilePath);
		if (!templateFile || !(templateFile instanceof TFile)) {
			throw new Error(`Template file not found: ${templateFilePath}`);
		}

		const targetFile = this.app.vault.getAbstractFileByPath(targetFilePath);
		if (!targetFile || !(targetFile instanceof TFile)) {
			throw new Error(`Target file not found: ${targetFilePath}`);
		}

		const runningConfig = templaterAPI.create_running_config(
			templateFile,
			targetFile,
			Templater_RunMode.DynamicProcessor,
		);

		return await templaterAPI.read_and_parse_template(runningConfig);
	}

	public async createNoteWithTemplater(
		templateFilePath: string,
		folderPath?: string,
		fileName?: string,
		openNote: boolean = false,
		newTab: boolean = false,
	): Promise<string | undefined> {
		const templaterAPI = getTemplaterPluginAPI(this.omb);

		const templateFile = this.app.vault.getAbstractFileByPath(templateFilePath);
		if (!templateFile || !(templateFile instanceof TFile)) {
			throw new Error(`Template file not found: ${templateFilePath}`);
		}

		let folder: TFolder | undefined;

		if (folderPath !== undefined) {
			const folderTFile = this.app.vault.getAbstractFileByPath(folderPath);
			if (!folderTFile || !(folderTFile instanceof TFolder)) {
				throw new Error(`Folder not found: ${folderPath}`);
			}
			folder = folderTFile;
		}

		const newFile = await templaterAPI.create_new_note_from_template(templateFile, folder, fileName, false);

		if (openNote && newFile) {
			await this.mb.file.openInSourceMode(newFile, newTab);
		}

		return newFile?.path;
	}
}

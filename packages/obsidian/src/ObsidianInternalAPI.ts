import {
	type App,
	Component,
	MarkdownRenderer,
	normalizePath,
	Notice,
	parseYaml,
	setIcon,
	stringifyYaml,
	TFile,
	TFolder,
} from 'obsidian';
import { type Command, InternalAPI, type ModalOptions } from 'packages/core/src/api/InternalAPI';
import {
	type ImageSuggesterLikeIPF,
	type SuggesterLikeIFP,
	type SuggesterOption,
} from 'packages/core/src/fields/inputFields/fields/Suggester/SuggesterHelper';
import { type IJsRenderer } from 'packages/core/src/utils/IJsRenderer';
import { type MBLiteral } from 'packages/core/src/utils/Literal';
import { getJsEnginePluginAPI, getTemplaterPluginAPI, Templater_RunMode } from 'packages/obsidian/src/ObsUtils';
import { ObsidianJsRenderer } from 'packages/obsidian/src/ObsidianJsRenderer';
import type MetaBindPlugin from 'packages/obsidian/src/main';
import { type ModalContent } from 'packages/core/src/modals/ModalContent';
import { ObsidianModal } from 'packages/obsidian/src/modals/ObsidianModal';
import { ObsidianSearchModal } from 'packages/obsidian/src/modals/ObsidianSearchModal';
import { type SelectModalContent } from 'packages/core/src/modals/SelectModalContent';
import { getImageSuggesterOptionsForInputField } from 'packages/obsidian/src/modals/ImageSuggesterModalHelper';
import { getSuggesterOptionsForInputField } from 'packages/obsidian/src/modals/SuggesterModalHelper';
import { type IFuzzySearch } from 'packages/core/src/utils/IFuzzySearch';
import { FuzzySearch } from 'packages/obsidian/src/FuzzySearch';
import { type ContextMenuItemDefinition, type IContextMenu } from 'packages/core/src/utils/IContextMenu';
import { ObsidianContextMenu } from 'packages/obsidian/src/ObsidianContextMenu';
import { z, type ZodType } from 'zod';
import { type LifecycleHook } from 'packages/core/src/api/API';

export class ObsidianInternalAPI extends InternalAPI<MetaBindPlugin> {
	readonly app: App;

	constructor(plugin: MetaBindPlugin) {
		super(plugin);

		this.app = plugin.app;
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public getLifecycleHookValidator(): ZodType<LifecycleHook, any, any> {
		return z.instanceof(Component);
	}

	public getImageSuggesterOptions(inputField: ImageSuggesterLikeIPF): SuggesterOption<string>[] {
		return getImageSuggesterOptionsForInputField(this.plugin, inputField);
	}

	public getSuggesterOptions(inputField: SuggesterLikeIFP): SuggesterOption<MBLiteral>[] {
		return getSuggesterOptionsForInputField(this.plugin, inputField);
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
			getJsEnginePluginAPI(this.plugin);
			return true;
		} catch (e) {
			return false;
		}
	}

	public async jsEngineRunFile(
		filePath: string,
		callingFilePath: string,
		contextOverrides: Record<string, unknown>,
		container?: HTMLElement,
	): Promise<() => void> {
		const jsEngineAPI = getJsEnginePluginAPI(this.plugin);

		const callingFile = this.app.vault.getAbstractFileByPath(callingFilePath);
		if (!callingFile || !(callingFile instanceof TFile)) {
			throw new Error(`calling file not found: ${callingFilePath}`);
		}
		const metadata = this.app.metadataCache.getFileCache(callingFile);

		const component = new Component();
		await jsEngineAPI.internal.executeFile(filePath, {
			component: component,
			container: container,
			context: {
				metadata: metadata,
				file: callingFile,
				line: 0,
			},
			contextOverrides: contextOverrides,
		});

		return () => component.unload();
	}

	public async jsEngineRunCode(code: string, callingFilePath: string, container?: HTMLElement): Promise<() => void> {
		const jsEngineAPI = getJsEnginePluginAPI(this.plugin);

		const callingFile = this.app.vault.getAbstractFileByPath(callingFilePath);
		if (!callingFile || !(callingFile instanceof TFile)) {
			throw new Error(`calling file not found: ${callingFilePath}`);
		}
		const metadata = this.app.metadataCache.getFileCache(callingFile);

		const component = new Component();
		await jsEngineAPI.internal.execute({
			code: code,
			component: component,
			container: container,
			context: {
				metadata: metadata,
				file: callingFile,
				line: 0,
			},
		});

		return () => component.unload();
	}

	public createJsRenderer(container: HTMLElement, filePath: string, code: string): IJsRenderer {
		return new ObsidianJsRenderer(this.plugin, container, filePath, code);
	}

	public openFile(filePath: string, callingFilePath: string, newTab: boolean): void {
		void this.app.workspace.openLinkText(filePath, callingFilePath, newTab);
	}

	public getFilePathByName(name: string, relativeTo: string = ''): string | undefined {
		return this.app.metadataCache.getFirstLinkpathDest(name, relativeTo)?.path;
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

	public createModal(content: ModalContent, options: ModalOptions): ObsidianModal {
		return new ObsidianModal(this.plugin, content, options);
	}

	public createSearchModal<T>(content: SelectModalContent<T>): ObsidianSearchModal<T> {
		return new ObsidianSearchModal(this.plugin, content);
	}

	public getAllCommands(): Command[] {
		return this.app.commands.listCommands().map(command => ({
			id: command.id,
			name: command.name,
		}));
	}

	public getAllFiles(): string[] {
		return this.app.vault
			.getAllLoadedFiles()
			.filter(file => file instanceof TFile)
			.map(file => file.path);
	}

	public getAllFolders(): string[] {
		return this.app.vault
			.getAllLoadedFiles()
			.filter(file => file instanceof TFolder)
			.map(file => file.path);
	}

	public createFuzzySearch(): IFuzzySearch {
		return new FuzzySearch();
	}

	public async readFilePath(filePath: string): Promise<string> {
		const tFile = this.app.vault.getAbstractFileByPath(filePath);
		if (!tFile || !(tFile instanceof TFile)) {
			throw new Error(`file not found: ${filePath}`);
		}

		return this.app.vault.cachedRead(tFile);
	}

	public writeFilePath(filePath: string, content: string): Promise<void> {
		return this.app.vault.adapter.write(filePath, content);
	}

	public createContextMenu(items: ContextMenuItemDefinition[]): IContextMenu {
		const menu = new ObsidianContextMenu();
		menu.setItems(items);
		return menu;
	}

	public async createFile(folderPath: string, fileName: string, extension: string, open?: boolean): Promise<string> {
		const path = this.app.vault.getAvailablePath(normalizePath(folderPath + '/' + fileName), extension);
		const newFile = await this.app.vault.create(path, '');

		if (open) {
			const activeLeaf = this.app.workspace.getLeaf(false);
			if (activeLeaf) {
				await activeLeaf.openFile(newFile, {
					state: { mode: 'source' },
				});
			}
		}

		return newFile.path;
	}

	public async evaluateTemplaterTemplate(templateFilePath: string, targetFilePath: string): Promise<string> {
		const templaterAPI = getTemplaterPluginAPI(this.plugin);

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
		openNote?: boolean,
	): Promise<string | undefined> {
		const templaterAPI = getTemplaterPluginAPI(this.plugin);

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

		const newFile = await templaterAPI.create_new_note_from_template(
			templateFile,
			folder,
			fileName,
			openNote ?? true,
		);
		return newFile?.path;
	}
}

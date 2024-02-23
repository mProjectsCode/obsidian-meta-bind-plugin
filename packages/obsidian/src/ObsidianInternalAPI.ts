import {
	type App,
	Component,
	MarkdownRenderer,
	Notice,
	parseYaml,
	setIcon,
	TFile,
	TFolder,
	stringifyYaml,
} from 'obsidian';
import { InternalAPI, type Command, type ModalOptions } from 'packages/core/src/api/InternalAPI';
import { type ImageSuggesterIPF } from 'packages/core/src/fields/inputFields/fields/ImageSuggester/ImageSuggesterIPF';
import {
	type SuggesterLikeIFP,
	type SuggesterOption,
} from 'packages/core/src/fields/inputFields/fields/Suggester/SuggesterHelper';
import { type IJsRenderer } from 'packages/core/src/utils/IJsRenderer';
import { type MBLiteral } from 'packages/core/src/utils/Literal';
import { getJsEnginePluginAPI } from 'packages/obsidian/src/ObsUtils';
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

export class ObsidianInternalAPI extends InternalAPI<MetaBindPlugin> {
	readonly app: App;

	constructor(plugin: MetaBindPlugin) {
		super(plugin);

		this.app = plugin.app;
	}

	public getImageSuggesterOptions(inputField: ImageSuggesterIPF): SuggesterOption<string>[] {
		return getImageSuggesterOptionsForInputField(this.plugin, inputField);
	}

	public getSuggesterOptions(inputField: SuggesterLikeIFP): SuggesterOption<MBLiteral>[] {
		return getSuggesterOptionsForInputField(this.plugin, inputField);
	}

	public async renderMarkdown(markdown: string, element: HTMLElement, filePath: string): Promise<() => void> {
		const component = new Component();
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

	public getFilePathByName(name: string): string | undefined {
		return this.app.metadataCache.getFirstLinkpathDest(name, '')?.path;
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
}

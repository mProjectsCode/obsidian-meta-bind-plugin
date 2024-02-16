import { type ErrorIndicatorProps, type IInternalAPI } from './IInternalAPI';
import type MetaBindPlugin from '../main';
import { type App, Component, MarkdownRenderer, Notice, TFile, parseYaml } from 'obsidian';
import { type DatePickerIPF } from '../fields/inputFields/fields/DatePicker/DatePickerIPF';
import { type ImageSuggesterIPF } from '../fields/inputFields/fields/ImageSuggester/ImageSuggesterIPF';
import { type SuggesterLikeIFP, type SuggesterOption } from '../fields/inputFields/fields/Suggester/SuggesterHelper';
import { type MBLiteral } from '../utils/Literal';
import { TextPromptModal } from '../utils/modals/TextPromptModal';
import { openSuggesterModalForInputField } from '../fields/inputFields/fields/Suggester/SuggesterModalHelper';
import { openImageSuggesterModalForInputField } from '../fields/inputFields/fields/ImageSuggester/ImageSuggesterModalHelper';
import { DatePickerInputModal } from '../fields/inputFields/fields/DatePicker/DatePickerInputModal';
import { getJsEnginePluginAPI } from '../utils/ObsUtils';
import ErrorIndicatorComponent from '../utils/errors/ErrorIndicatorComponent.svelte';
import { type IJsRenderer } from '../fields/viewFields/jsRenderer/IJsRenderer';
import { ObsidianJsRenderer } from '../fields/viewFields/jsRenderer/ObsidianJsRenderer';

export class ObsidianInternalAPI implements IInternalAPI {
	readonly plugin: MetaBindPlugin;
	readonly app: App;

	constructor(plugin: MetaBindPlugin) {
		this.plugin = plugin;
		this.app = plugin.app;
	}

	public openDatePickerModal(inputField: DatePickerIPF): void {
		new DatePickerInputModal(this.app, inputField).open();
	}

	public openImageSuggesterModal(inputField: ImageSuggesterIPF, selectCallback: (selected: string) => void): void {
		openImageSuggesterModalForInputField(inputField, selectCallback, this.plugin);
	}

	public openSuggesterModal(
		inputField: SuggesterLikeIFP,
		selectCallback: (selected: SuggesterOption<MBLiteral>) => void,
	): void {
		openSuggesterModalForInputField(inputField, selectCallback, this.plugin);
	}

	public openTextPromptModal(
		value: string,
		title: string,
		subTitle: string,
		description: string,
		onSubmit: (value: string) => void,
		onCancel: () => void,
	): void {
		new TextPromptModal(this.app, value, title, subTitle, description, onSubmit, onCancel).open();
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

	public createErrorIndicator(element: HTMLElement, props: ErrorIndicatorProps): void {
		new ErrorIndicatorComponent({
			target: element,
			props: {
				app: this.plugin.app,
				props: props,
			},
		});
	}

	public parseYaml(yaml: string): unknown {
		return parseYaml(yaml);
	}
}

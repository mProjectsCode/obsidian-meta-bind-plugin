import { type IInternalAPI } from './IInternalAPI';
import type MetaBindPlugin from '../../main';
import { type App, Component, MarkdownRenderer, Notice, TFile } from 'obsidian';
import { type DatePickerIPF } from '../../fields/inputFields/fields/DatePicker/DatePickerIPF';
import { type ImageSuggesterIPF } from '../../fields/inputFields/fields/ImageSuggester/ImageSuggesterIPF';
import { type SuggesterLikeIFP, type SuggesterOption } from '../../fields/inputFields/fields/Suggester/SuggesterHelper';
import { type MBLiteral } from '../../utils/Literal';
import { TextPromptModal } from '../../utils/modals/TextPromptModal';
import { openSuggesterModalForInputField } from '../../fields/inputFields/fields/Suggester/SuggesterModalHelper';
import { openImageSuggesterModalForInputField } from '../../fields/inputFields/fields/ImageSuggester/ImageSuggesterModalHelper';
import { DatePickerInputModal } from '../../fields/inputFields/fields/DatePicker/DatePickerInputModal';
import { getJsEnginePluginAPI } from '../../utils/ObsUtils';

export class ObsidianAPIAdapter implements IInternalAPI {
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

	public openFile(filePath: string, callingFilePath: string): void {
		void this.app.workspace.openLinkText(filePath, callingFilePath, true);
	}

	public getFilePathByName(name: string): string | undefined {
		return this.app.metadataCache.getFirstLinkpathDest(name, '')?.path;
	}

	public showNotice(message: string): void {
		new Notice(message);
	}
}

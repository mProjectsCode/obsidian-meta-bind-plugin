import { type DatePickerIPF } from 'packages/core/src/fields/inputFields/fields/DatePicker/DatePickerIPF';
import { type ImageSuggesterIPF } from 'packages/core/src/fields/inputFields/fields/ImageSuggester/ImageSuggesterIPF';
import {
	type SuggesterLikeIFP,
	type SuggesterOption,
} from 'packages/core/src/fields/inputFields/fields/Suggester/SuggesterHelper';
import { type IJsRenderer } from 'packages/core/src/utils/IJsRenderer';
import { type MBLiteral } from 'packages/core/src/utils/Literal';
import type { ErrorCollection } from 'packages/core/src/utils/errors/ErrorCollection';
import { type SelectModalContent } from 'packages/core/src/modals/SelectModalContent';
import { type IModal } from 'packages/core/src/modals/IModal';
import { CommandSelectModal } from 'packages/core/src/modals/selectModalContents/CommandSelectModal';
import { type IPlugin } from 'packages/core/src/IPlugin';
import { FileSelectModal } from 'packages/core/src/modals/selectModalContents/FileSelectModal';
import { FolderSelectModal } from 'packages/core/src/modals/selectModalContents/FolderSelectModal';
import { type ModalContent } from 'packages/core/src/modals/ModalContent';
import {
	ButtonBuilderModal,
	type ButtonBuilderModalOptions,
} from 'packages/core/src/modals/modalContents/ButtonBuilderModal';
import { SvelteModal } from 'packages/core/src/modals/modalContents/SvelteModal';
import DatePickerInput from 'packages/core/src/fields/inputFields/fields/DatePicker/DatePicker.svelte';
import ImageSuggesterModalComponent from 'packages/core/src/modals/modalContents/ImageSuggesterModalComponent.svelte';
import type { Moment } from 'moment';
import ErrorCollectionComponent from 'packages/core/src/utils/errors/ErrorCollectionComponent.svelte';
import ErrorIndicatorComponent from 'packages/core/src/utils/errors/ErrorIndicatorComponent.svelte';
import { SuggesterSelectModal } from 'packages/core/src/modals/selectModalContents/SuggesterSelectModal';
import { type IFuzzySearch } from 'packages/core/src/utils/IFuzzySearch';

export interface ErrorIndicatorProps {
	errorCollection: ErrorCollection;
	code?: string | undefined;
	text?: string | undefined;
	errorText?: string | undefined;
	warningText?: string | undefined;
}

export interface Command {
	id: string;
	name: string;
}

export interface ModalOptions {
	title: string;
	classes?: string[];
}

export abstract class InternalAPI<Plugin extends IPlugin> {
	plugin: Plugin;

	constructor(plugin: Plugin) {
		this.plugin = plugin;
	}

	abstract getImageSuggesterOptions(inputField: ImageSuggesterIPF): SuggesterOption<string>[];

	abstract getSuggesterOptions(inputField: SuggesterLikeIFP): SuggesterOption<MBLiteral>[];

	abstract renderMarkdown(markdown: string, element: HTMLElement, filePath: string): Promise<() => void>;

	abstract executeCommandById(id: string): boolean;

	abstract isJsEngineAvailable(): boolean;

	abstract jsEngineRunFile(filePath: string, callingFilePath: string, container?: HTMLElement): Promise<() => void>;

	abstract jsEngineRunCode(code: string, callingFilePath: string, container?: HTMLElement): Promise<() => void>;

	abstract createJsRenderer(container: HTMLElement, filePath: string, code: string): IJsRenderer;

	abstract openFile(filePath: string, callingFilePath: string, newTab: boolean): void;

	abstract getFilePathByName(name: string): string | undefined;

	abstract showNotice(message: string): void;

	abstract parseYaml(yaml: string): unknown;

	abstract stringifyYaml(yaml: unknown): string;

	abstract setIcon(element: HTMLElement, icon: string): void;

	abstract imagePathToUri(imagePath: string): string;

	abstract getAllFiles(): string[];

	abstract getAllFolders(): string[];

	abstract getAllCommands(): Command[];

	abstract createSearchModal<T>(content: SelectModalContent<T>): IModal;

	abstract createModal(content: ModalContent, options?: ModalOptions): IModal;

	abstract createFuzzySearch(): IFuzzySearch;

	openCommandSelectModal(selectCallback: (selected: Command) => void): void {
		this.createSearchModal(new CommandSelectModal(this.plugin, selectCallback)).open();
	}

	openFileSelectModal(selectCallback: (selected: string) => void): void {
		this.createSearchModal(new FileSelectModal(this.plugin, selectCallback)).open();
	}

	openFolderSelectModal(selectCallback: (selected: string) => void): void {
		this.createSearchModal(new FolderSelectModal(this.plugin, selectCallback)).open();
	}

	openButtonBuilderModal(options: ButtonBuilderModalOptions): void {
		this.createModal(new ButtonBuilderModal(this.plugin, options), { title: 'Meta Bind Button Builder' }).open();
	}

	openSuggesterModal(
		inputField: SuggesterLikeIFP,
		selectCallback: (selected: SuggesterOption<MBLiteral>) => void,
	): void {
		this.createSearchModal(new SuggesterSelectModal(this.plugin, selectCallback, inputField)).open();
	}

	openImageSuggesterModal(inputField: ImageSuggesterIPF, selectCallback: (selected: string) => void): void {
		this.createModal(
			new SvelteModal((modal, targetEl) => {
				return new ImageSuggesterModalComponent({
					target: targetEl,
					props: {
						plugin: this.plugin,
						options: this.getImageSuggesterOptions(inputField),
						onSelect: (item: string): void => {
							selectCallback(item);
							modal.closeModal();
						},
					},
				});
			}),
			{
				title: 'Meta Bind Image Suggester',
			},
		).open();
	}

	openDatePickerModal(inputField: DatePickerIPF): void {
		this.createModal(
			new SvelteModal((modal, targetEl) => {
				return new DatePickerInput({
					target: targetEl,
					props: {
						selectedDate: inputField.getInternalValue(),
						dateChangeCallback: (value: Moment | null): void => {
							inputField.setInternalValue(value);
							modal.closeModal();
						},
					},
				});
			}),
			{
				title: 'Meta Bind Date Picker',
			},
		).open();
	}

	openTextPromptModal(
		_value: string,
		_title: string,
		_subTitle: string,
		_description: string,
		_onSubmit: (value: string) => void,
		_onCancel: () => void,
	): void {
		throw new Error('Method not implemented.');
	}

	openErrorCollectionViewModal(settings: ErrorIndicatorProps): void {
		this.createModal(
			new SvelteModal((_modal, targetEl) => {
				return new ErrorCollectionComponent({
					target: targetEl,
					props: {
						settings: settings,
					},
				});
			}),
			{
				title: 'Meta Bind Error Overview',
				classes: ['mb-error-collection-modal', 'markdown-rendered'],
			},
		).open();
	}

	createErrorIndicator(element: HTMLElement, settings: ErrorIndicatorProps): void {
		new ErrorIndicatorComponent({
			target: element,
			props: {
				plugin: this.plugin,
				settings: settings,
			},
		});
	}
}

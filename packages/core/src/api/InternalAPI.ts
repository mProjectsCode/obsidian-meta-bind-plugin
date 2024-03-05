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
import { type ContextMenuItemDefinition, type IContextMenu } from 'packages/core/src/utils/IContextMenu';

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

	/**
	 * Get the options for the image suggester input field.
	 *
	 * @param inputField
	 */
	abstract getImageSuggesterOptions(inputField: ImageSuggesterIPF): SuggesterOption<string>[];

	/**
	 * Get the options for the suggester input field.
	 *
	 * @param inputField
	 */
	abstract getSuggesterOptions(inputField: SuggesterLikeIFP): SuggesterOption<MBLiteral>[];

	/**
	 * Render markdown to an element.
	 *
	 * @param markdown
	 * @param element
	 * @param filePath
	 *
	 * @returns Cleanup callback.
	 */
	abstract renderMarkdown(markdown: string, element: HTMLElement, filePath: string): Promise<() => void>;

	/**
	 * Runs a command by its id.
	 *
	 * @param id
	 */
	abstract executeCommandById(id: string): boolean;

	/**
	 * Check if the js engine plugin is available.
	 */
	abstract isJsEngineAvailable(): boolean;

	/**
	 *  Run a file using js engine.
	 *
	 * @param filePath
	 * @param callingFilePath
	 * @param container
	 *
	 * @returns Cleanup callback.
	 */
	abstract jsEngineRunFile(filePath: string, callingFilePath: string, scriptParams?: string, container?: HTMLElement): Promise<() => void>;

	/**
	 * Run code using js engine.
	 *
	 * @param code
	 * @param callingFilePath
	 * @param container
	 *
	 * @returns Cleanup callback.
	 */
	abstract jsEngineRunCode(code: string, callingFilePath: string, container?: HTMLElement): Promise<() => void>;

	/**
	 * Creates a js renderer, used for the js view field.
	 *
	 * @param container
	 * @param filePath
	 * @param code
	 */
	abstract createJsRenderer(container: HTMLElement, filePath: string, code: string): IJsRenderer;

	/**
	 * Open a specific file.
	 *
	 * @param filePath
	 * @param callingFilePath
	 * @param newTab
	 */
	abstract openFile(filePath: string, callingFilePath: string, newTab: boolean): void;

	/**
	 * Resolves a file name to a file path.
	 *
	 * @param name
	 * @param relativeTo
	 */
	abstract getFilePathByName(name: string, relativeTo?: string): string | undefined;

	/**
	 * Shows a notice to the user.
	 *
	 * @param message
	 */
	abstract showNotice(message: string): void;

	abstract parseYaml(yaml: string): unknown;

	abstract stringifyYaml(yaml: unknown): string;

	/**
	 * Add an icon to an element.
	 *
	 * @param element
	 * @param icon
	 */
	abstract setIcon(element: HTMLElement, icon: string): void;

	/**
	 * Get the uri for a path to an image.
	 *
	 * @param imagePath
	 */
	abstract imagePathToUri(imagePath: string): string;

	/**
	 * List all files by their path.
	 */
	abstract getAllFiles(): string[];

	/**
	 * List all folders by their path.
	 */
	abstract getAllFolders(): string[];

	/**
	 * List all commands.
	 */
	abstract getAllCommands(): Command[];

	/**
	 * Creates a search modal with the given content.
	 *
	 * @param content
	 */
	abstract createSearchModal<T>(content: SelectModalContent<T>): IModal;

	/**
	 * Creates a modal with the given content.
	 *
	 * @param content
	 * @param options
	 */
	abstract createModal(content: ModalContent, options?: ModalOptions): IModal;

	/**
	 * Creates a fuzzy search instance.
	 */
	abstract createFuzzySearch(): IFuzzySearch;

	/**
	 * Read a files content.
	 *
	 * @param filePath
	 */
	abstract readFilePath(filePath: string): Promise<string>;

	abstract createContextMenu(items: ContextMenuItemDefinition[]): IContextMenu;

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
				classes: ['mb-image-suggester-modal'],
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

	/**
	 * Create an error indicator in the given element.
	 *
	 * @param element
	 * @param settings
	 */
	createErrorIndicator(element: HTMLElement, settings: ErrorIndicatorProps): void {
		new ErrorIndicatorComponent({
			target: element,
			props: {
				plugin: this.plugin,
				settings: settings,
			},
		});
	}

	/**
	 * Checks if a file path has been excluded in the settings.
	 *
	 * @param filePath
	 */
	isFilePathExcluded(filePath: string): boolean {
		for (const excludedFolder of this.plugin.settings.excludedFolders) {
			if (filePath.startsWith(excludedFolder)) {
				return true;
			}
		}

		return false;
	}
}

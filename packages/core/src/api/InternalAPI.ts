import type { Moment } from 'moment';
import type { LifecycleHook } from 'packages/core/src/api/API';
import type { FileAPI } from 'packages/core/src/api/FileAPI';
import DatePickerInput from 'packages/core/src/fields/inputFields/fields/DatePicker/DatePicker.svelte';
import type { DatePickerIPF } from 'packages/core/src/fields/inputFields/fields/DatePicker/DatePickerIPF';
import type {
	ImageSuggesterLikeIPF,
	SuggesterLikeIFP,
	SuggesterOption,
} from 'packages/core/src/fields/inputFields/fields/Suggester/SuggesterHelper';
import type { IPlugin } from 'packages/core/src/IPlugin';
import type { IModal } from 'packages/core/src/modals/IModal';
import type { ModalContent } from 'packages/core/src/modals/ModalContent';
import type { ButtonBuilderModalOptions } from 'packages/core/src/modals/modalContents/buttonBuilder/ButtonBuilderModal';
import { ButtonBuilderModal } from 'packages/core/src/modals/modalContents/buttonBuilder/ButtonBuilderModal';
import ImageSuggesterModalComponent from 'packages/core/src/modals/modalContents/ImageSuggesterModalComponent.svelte';
import { SvelteModalContent } from 'packages/core/src/modals/modalContents/SvelteModalContent';
import TextPromptModalContent from 'packages/core/src/modals/modalContents/TextPromptModalContent.svelte';
import type { SelectModalContent } from 'packages/core/src/modals/SelectModalContent';
import { CommandSelectModal } from 'packages/core/src/modals/selectModalContents/CommandSelectModal';
import { FileSelectModal } from 'packages/core/src/modals/selectModalContents/FileSelectModal';
import { FolderSelectModal } from 'packages/core/src/modals/selectModalContents/FolderSelectModal';
import { SuggesterSelectModal } from 'packages/core/src/modals/selectModalContents/SuggesterSelectModal';
import type { ErrorCollection } from 'packages/core/src/utils/errors/ErrorCollection';
import ErrorCollectionComponent from 'packages/core/src/utils/errors/ErrorCollectionComponent.svelte';
import ErrorIndicatorComponent from 'packages/core/src/utils/errors/ErrorIndicatorComponent.svelte';
import type { ContextMenuItemDefinition, IContextMenu } from 'packages/core/src/utils/IContextMenu';
import type { IFuzzySearch } from 'packages/core/src/utils/IFuzzySearch';
import type { IJsRenderer } from 'packages/core/src/utils/IJsRenderer';
import type { MBLiteral } from 'packages/core/src/utils/Literal';
import { mount } from 'svelte';
import type { z } from 'zod';

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

export interface TextPromptModalOptions extends ModalOptions {
	value: string;
	subTitle: string;
	multiline: boolean;
	onSubmit: (value: string) => void;
	onCancel: () => void;
}

export const IMAGE_FILE_EXTENSIONS = [
	'apng',
	'avif',
	'gif',
	'jpg',
	'jpeg',
	'jfif',
	'pjpeg',
	'pjp',
	'png',
	'svg',
	'webp',
];
export const IMAGE_FILE_EXTENSIONS_WITH_DOTS = IMAGE_FILE_EXTENSIONS.map(ext => `.${ext}`);

export abstract class InternalAPI<Plugin extends IPlugin> {
	readonly plugin: Plugin;
	readonly file: FileAPI<Plugin>;

	constructor(plugin: Plugin, fileAPI: FileAPI<Plugin>) {
		this.plugin = plugin;
		this.file = fileAPI;
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	abstract getLifecycleHookValidator(): z.ZodType<LifecycleHook, any, any>;

	/**
	 * Get the options for the image suggester input field.
	 *
	 * @param inputField
	 */
	abstract getImageSuggesterOptions(inputField: ImageSuggesterLikeIPF): SuggesterOption<string>[];

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
	 * @param configOverrides
	 * @param container
	 *
	 * @returns Cleanup callback.
	 */
	abstract jsEngineRunFile(
		filePath: string,
		callingFilePath: string,
		configOverrides: Record<string, unknown>,
		container?: HTMLElement,
	): Promise<() => void>;

	/**
	 * Run code using js engine.
	 *
	 * @param code
	 * @param callingFilePath
	 * @param contextOverrides
	 * @param container
	 *
	 * @returns Cleanup callback.
	 */
	abstract jsEngineRunCode(
		code: string,
		callingFilePath: string,
		contextOverrides: Record<string, unknown>,
		container?: HTMLElement,
	): Promise<() => void>;

	/**
	 * Creates a js renderer, used for the js view field.
	 *
	 * @param container
	 * @param filePath
	 * @param code
	 * @param hidden
	 */
	abstract createJsRenderer(container: HTMLElement, filePath: string, code: string, hidden: boolean): IJsRenderer;

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

	abstract createContextMenu(items: ContextMenuItemDefinition[]): IContextMenu;

	abstract evaluateTemplaterTemplate(templateFilePath: string, targetFilePath: string): Promise<string>;

	abstract createNoteWithTemplater(
		templateFilePath: string,
		folderPath?: string,
		fileName?: string,
		openNote?: boolean,
	): Promise<string | undefined>;

	openCommandSelectModal(selectCallback: (selected: Command) => void): void {
		this.createSearchModal(new CommandSelectModal(this.plugin, selectCallback)).open();
	}

	openFileSelectModal(selectCallback: (selected: string) => void): void {
		this.createSearchModal(new FileSelectModal(this.plugin, selectCallback)).open();
	}

	openFilteredFileSelectModal(
		selectCallback: (selected: string) => void,
		filterFunction: (filePath: string) => boolean,
	): void {
		this.createSearchModal(new FileSelectModal(this.plugin, selectCallback, filterFunction)).open();
	}

	openMarkdownFileSelectModal(selectCallback: (selected: string) => void): void {
		this.openFilteredFileSelectModal(selectCallback, filePath => filePath.endsWith('.md'));
	}

	openImageFileSelectModal(selectCallback: (selected: string) => void): void {
		this.openFilteredFileSelectModal(selectCallback, filePath =>
			IMAGE_FILE_EXTENSIONS_WITH_DOTS.some(ext => filePath.endsWith(ext)),
		);
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

	openImageSuggesterModal(inputField: ImageSuggesterLikeIPF, selectCallback: (selected: string) => void): void {
		this.createModal(
			new SvelteModalContent((modal, targetEl) => {
				return mount(ImageSuggesterModalComponent, {
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
				title: 'Meta Bind image suggester',
				classes: ['mb-image-suggester-modal'],
			},
		).open();
	}

	openDatePickerModal(inputField: DatePickerIPF): void {
		this.createModal(
			new SvelteModalContent((modal, targetEl) => {
				return mount(DatePickerInput, {
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
				title: 'Meta Bind date picker',
			},
		).open();
	}

	openTextPromptModal(options: TextPromptModalOptions): void {
		this.createModal(
			new SvelteModalContent((modal, targetEl) => {
				return mount(TextPromptModalContent, {
					target: targetEl,
					props: {
						options: {
							...options,
							onSubmit: (value: string): void => {
								options.onSubmit(value);
								modal.closeModal();
							},
							onCancel: (): void => {
								options.onCancel();
								modal.closeModal();
							},
						},
					},
				});
			}),
			options,
		).open();
	}

	openErrorCollectionViewModal(settings: ErrorIndicatorProps): void {
		this.createModal(
			new SvelteModalContent((_modal, targetEl) => {
				return mount(ErrorCollectionComponent, {
					target: targetEl,
					props: {
						settings: settings,
					},
				});
			}),
			{
				title: 'Meta Bind error overview',
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
		mount(ErrorIndicatorComponent, {
			target: element,
			props: {
				plugin: this.plugin,
				settings: settings,
			},
		});
	}
}

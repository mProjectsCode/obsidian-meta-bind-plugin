import { Notice, parseYaml, stringifyYaml, setIcon, Component } from 'obsidian/publish';
import type { LifecycleHook } from 'packages/core/src/api/API';
import type { Command, ModalOptions } from 'packages/core/src/api/InternalAPI';
import { InternalAPI } from 'packages/core/src/api/InternalAPI';
import type { ImageSuggesterIPF } from 'packages/core/src/fields/inputFields/fields/ImageSuggester/ImageSuggesterIPF';
import type {
	SuggesterLikeIFP,
	SuggesterOption,
} from 'packages/core/src/fields/inputFields/fields/Suggester/SuggesterHelper';
import type { IModal } from 'packages/core/src/modals/IModal';
import type { ModalContent } from 'packages/core/src/modals/ModalContent';
import type { SelectModalContent } from 'packages/core/src/modals/SelectModalContent';
import type { ContextMenuItemDefinition, IContextMenu } from 'packages/core/src/utils/IContextMenu';
import type { IFuzzySearch } from 'packages/core/src/utils/IFuzzySearch';
import type { IJsRenderer } from 'packages/core/src/utils/IJsRenderer';
import type { MBLiteral } from 'packages/core/src/utils/Literal';
import type { MetaBindPublishPlugin } from 'packages/publish/src/main';
import { PublishFileAPI } from 'packages/publish/src/PublishFileAPI';
import type { ZodType } from 'zod';
import { z } from 'zod';

// TODO: implement
export class PublishInternalAPI extends InternalAPI<MetaBindPublishPlugin> {
	constructor(plugin: MetaBindPublishPlugin) {
		super(plugin, new PublishFileAPI(plugin));
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public getLifecycleHookValidator(): ZodType<LifecycleHook, any, any> {
		return z.instanceof(Component);
	}

	public async renderMarkdown(markdown: string, element: HTMLElement, _filePath: string): Promise<() => void> {
		element.innerText += markdown;
		return () => {};
	}

	public executeCommandById(_id: string): boolean {
		throw new Error('not implemented');
	}

	public isJsEngineAvailable(): boolean {
		return false;
	}

	public jsEngineRunFile(
		_filePath: string,
		_callingFilePath: string,
		_configOverrides: Record<string, unknown>,
		_container?: HTMLElement,
	): Promise<() => void> {
		return Promise.reject(new Error('not implemented'));
	}

	public jsEngineRunCode(
		_code: string,
		_callingFilePath: string,
		_contextOverrides: Record<string, unknown>,
		_container?: HTMLElement,
	): Promise<() => void> {
		return Promise.reject(new Error('not implemented'));
	}

	public createJsRenderer(_container: HTMLElement, _filePath: string, _code: string, _hidden: boolean): IJsRenderer {
		throw new Error('not implemented');
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
		return imagePath;
	}

	public createFuzzySearch(): IFuzzySearch {
		throw new Error('not implemented');
	}

	public createModal(_content: ModalContent, _options: ModalOptions | undefined): IModal {
		throw new Error('not implemented');
	}

	public createSearchModal<T>(_content: SelectModalContent<T>): IModal {
		throw new Error('not implemented');
	}

	public getAllCommands(): Command[] {
		return [];
	}

	public getImageSuggesterOptions(_inputField: ImageSuggesterIPF): SuggesterOption<string>[] {
		return [];
	}

	public getSuggesterOptions(_inputField: SuggesterLikeIFP): SuggesterOption<MBLiteral>[] {
		return [];
	}

	public readFilePath(_filePath: string): Promise<string> {
		return Promise.resolve('');
	}

	public createContextMenu(_items: ContextMenuItemDefinition[]): IContextMenu {
		throw new Error('not implemented');
	}

	public createNoteWithTemplater(
		_templateFilePath: string,
		_folderPath?: string,
		_fileName?: string,
		_openNote?: boolean,
	): Promise<string | undefined> {
		throw new Error('not implemented');
	}

	public evaluateTemplaterTemplate(_templateFilePath: string, _targetFilePath: string): Promise<string> {
		throw new Error('not implemented');
	}
}

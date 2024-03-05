import { type Command, InternalAPI, type ModalOptions } from 'packages/core/src/api/InternalAPI';
import { type ImageSuggesterIPF } from 'packages/core/src/fields/inputFields/fields/ImageSuggester/ImageSuggesterIPF';
import {
	type SuggesterLikeIFP,
	type SuggesterOption,
} from 'packages/core/src/fields/inputFields/fields/Suggester/SuggesterHelper';
import { type IJsRenderer } from 'packages/core/src/utils/IJsRenderer';
import { type MBLiteral } from 'packages/core/src/utils/Literal';
import { type MetaBindPublishPlugin } from 'packages/publish/src/main';
import { type IFuzzySearch } from 'packages/core/src/utils/IFuzzySearch';
import { type ModalContent } from 'packages/core/src/modals/ModalContent';
import { type IModal } from 'packages/core/src/modals/IModal';
import { type SelectModalContent } from 'packages/core/src/modals/SelectModalContent';
import { type ContextMenuItemDefinition, type IContextMenu } from 'packages/core/src/utils/IContextMenu';

// TODO: implement
export class PublishInternalAPI extends InternalAPI<MetaBindPublishPlugin> {
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

	public jsEngineRunCode(_code: string, _callingFilePath: string, _container?: HTMLElement): Promise<() => void> {
		return Promise.reject(new Error('not implemented'));
	}

	public createJsRenderer(_container: HTMLElement, _filePath: string, _code: string): IJsRenderer {
		throw new Error('not implemented');
	}

	public openFile(_filePath: string, _callingFilePath: string, _newTab: boolean): void {
		throw new Error('not implemented');
	}

	public getFilePathByName(name: string, _relativeTo: string = ''): string | undefined {
		return name;
	}

	public showNotice(_: string): void {}

	public parseYaml(_yaml: string): unknown {
		return {};
	}

	public stringifyYaml(_yaml: unknown): string {
		return '';
	}

	public setIcon(_element: HTMLElement, _icon: string): void {}

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

	public getAllFiles(): string[] {
		return [];
	}

	public getAllFolders(): string[] {
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

	public createFile(_folderPath: string, _fileName: string, _extension: string, _open?: boolean): Promise<string> {
		return Promise.resolve('');
	}

	public createContextMenu(_items: ContextMenuItemDefinition[]): IContextMenu {
		throw new Error('not implemented');
	}
}

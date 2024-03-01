import { Command, InternalAPI, ModalOptions } from 'packages/core/src/api/InternalAPI';
import { ImageSuggesterIPF } from 'packages/core/src/fields/inputFields/fields/ImageSuggester/ImageSuggesterIPF';
import {
	SuggesterLikeIFP,
	SuggesterOption,
} from 'packages/core/src/fields/inputFields/fields/Suggester/SuggesterHelper';
import { IJsRenderer } from 'packages/core/src/utils/IJsRenderer';
import { MBLiteral } from 'packages/core/src/utils/Literal';
import { TestPlugin } from './TestPlugin';
import { IFuzzySearch } from 'packages/core/src/utils/IFuzzySearch';
import { ModalContent } from 'packages/core/src/modals/ModalContent';
import { IModal } from 'packages/core/src/modals/IModal';
import { SelectModalContent } from 'packages/core/src/modals/SelectModalContent';
import { ContextMenuItemDefinition, IContextMenu } from 'packages/core/src/utils/IContextMenu';
import { undefined } from 'zod';

export class TestInternalAPI extends InternalAPI<TestPlugin> {
	public async renderMarkdown(markdown: string, element: HTMLElement, _filePath: string): Promise<() => void> {
		element.innerText += markdown;
		return () => {};
	}

	public executeCommandById(_id: string): boolean {
		return true;
	}

	public isJsEngineAvailable(): boolean {
		return false;
	}

	public jsEngineRunFile(_filePath: string, _callingFilePath: string, _container?: HTMLElement): Promise<() => void> {
		return Promise.resolve(() => {});
	}

	public jsEngineRunCode(_code: string, _callingFilePath: string, _container?: HTMLElement): Promise<() => void> {
		return Promise.resolve(() => {});
	}

	public createJsRenderer(_container: HTMLElement, _filePath: string, _code: string): IJsRenderer {
		throw new Error('not implemented');
	}

	public openFile(_filePath: string, _callingFilePath: string, _newTab: boolean): void {}

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

	public createContextMenu(_items: ContextMenuItemDefinition[]): IContextMenu {
		throw new Error('not implemented');
	}
}

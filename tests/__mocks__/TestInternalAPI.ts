import { type Command, InternalAPI, type ModalOptions } from 'packages/core/src/api/InternalAPI';
import { ImageSuggesterIPF } from 'packages/core/src/fields/inputFields/fields/ImageSuggester/ImageSuggesterIPF';
import {
	type SuggesterLikeIFP,
	SuggesterOption,
} from 'packages/core/src/fields/inputFields/fields/Suggester/SuggesterHelper';
import type { IJsRenderer } from 'packages/core/src/utils/IJsRenderer';
import type { MBLiteral } from 'packages/core/src/utils/Literal';
import { TestPlugin } from './TestPlugin';
import type { IFuzzySearch } from 'packages/core/src/utils/IFuzzySearch';
import { ModalContent } from 'packages/core/src/modals/ModalContent';
import type { IModal } from 'packages/core/src/modals/IModal';
import { SelectModalContent } from 'packages/core/src/modals/SelectModalContent';
import type { ContextMenuItemDefinition, IContextMenu } from 'packages/core/src/utils/IContextMenu';
import { TestFileSystem } from 'tests/__mocks__/TestFileSystem';
import YAML from 'yaml';
import { z, ZodType } from 'zod';
import type { LifecycleHook } from 'packages/core/src/api/API';
import { TestFileAPI } from './TestFileAPI';

export class TestInternalAPI extends InternalAPI<TestPlugin> {
	constructor(plugin: TestPlugin) {
		super(plugin, new TestFileAPI(plugin));
	}

	public getLifecycleHookValidator(): ZodType<LifecycleHook, any, any> {
		return z.object({ register: z.function().returns(z.void()) });
	}

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

	public jsEngineRunFile(
		_filePath: string,
		_callingFilePath: string,
		_contextOverrides: Record<string, unknown>,
		_container?: HTMLElement,
	): Promise<() => void> {
		return Promise.resolve(() => {});
	}

	public jsEngineRunCode(
		_code: string,
		_callingFilePath: string,
		_contextOverrides: Record<string, unknown>,
		_container?: HTMLElement,
	): Promise<() => void> {
		return Promise.resolve(() => {});
	}

	public createJsRenderer(_container: HTMLElement, _filePath: string, _code: string, _hidden: boolean): IJsRenderer {
		throw new Error('not implemented');
	}

	public showNotice(_: string): void {}

	public parseYaml(yaml: string): unknown {
		return YAML.parse(yaml) as unknown;
	}

	public stringifyYaml(yaml: unknown): string {
		return YAML.stringify(yaml);
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

	public getImageSuggesterOptions(_inputField: ImageSuggesterIPF): SuggesterOption<string>[] {
		return [];
	}

	public getSuggesterOptions(_inputField: SuggesterLikeIFP): SuggesterOption<MBLiteral>[] {
		return [];
	}

	public createContextMenu(_items: ContextMenuItemDefinition[]): IContextMenu {
		throw new Error('not implemented');
	}

	public evaluateTemplaterTemplate(_templateFilePath: string, _targetFilePath: string): Promise<string> {
		return Promise.resolve('');
	}

	public async createNoteWithTemplater(
		_templateFilePath: string,
		folderPath?: string,
		fileName?: string,
		openNote?: boolean,
	): Promise<string | undefined> {
		return await this.file.create(folderPath ?? '', fileName ?? 'unnamed', 'md', openNote);
	}
}

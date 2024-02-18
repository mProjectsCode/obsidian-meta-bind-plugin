import { type ErrorIndicatorProps, type IInternalAPI } from '../api/IInternalAPI';
import { type MetaBindPublishPlugin } from './Publish';
import { type DatePickerIPF } from '../fields/inputFields/fields/DatePicker/DatePickerIPF';
import { type ImageSuggesterIPF } from '../fields/inputFields/fields/ImageSuggester/ImageSuggesterIPF';
import { type SuggesterLikeIFP, type SuggesterOption } from '../fields/inputFields/fields/Suggester/SuggesterHelper';
import { type MBLiteral } from '../utils/Literal';
import { type IJsRenderer } from '../fields/viewFields/jsRenderer/IJsRenderer';

// TODO: implement
export class PublishInternalAPI implements IInternalAPI {
	plugin: MetaBindPublishPlugin;

	constructor(plugin: MetaBindPublishPlugin) {
		this.plugin = plugin;
	}

	public openDatePickerModal(_inputField: DatePickerIPF): void {}

	public openImageSuggesterModal(_inputField: ImageSuggesterIPF, _selectCallback: (selected: string) => void): void {}

	public openSuggesterModal(
		_inputField: SuggesterLikeIFP,
		_selectCallback: (selected: SuggesterOption<MBLiteral>) => void,
	): void {}

	public openTextPromptModal(
		_value: string,
		_title: string,
		_subTitle: string,
		_description: string,
		_onSubmit: (value: string) => void,
		_onCancel: () => void,
	): void {}

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

	public jsEngineRunFile(_filePath: string, _callingFilePath: string, _container?: HTMLElement): Promise<() => void> {
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

	public getFilePathByName(name: string): string | undefined {
		return name;
	}

	public showNotice(_: string): void {}

	public createErrorIndicator(_: HTMLElement, _props: ErrorIndicatorProps): void {}

	public parseYaml(_yaml: string): unknown {
		return {};
	}
}

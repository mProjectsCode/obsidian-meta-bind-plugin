import { IInternalAPI } from '../../src/api/internalApi/IInternalAPI';
import { DatePickerIPF } from '../../src/fields/inputFields/fields/DatePicker/DatePickerIPF';
import { ImageSuggesterIPF } from '../../src/fields/inputFields/fields/ImageSuggester/ImageSuggesterIPF';
import { SuggesterLikeIFP, SuggesterOption } from '../../src/fields/inputFields/fields/Suggester/SuggesterHelper';
import { MBLiteral } from '../../src/utils/Literal';

import { TestPlugin } from './TestPlugin';
import { plugin } from 'bun';
import { undefined } from 'zod';

export class TestAPIAdapter implements IInternalAPI {
	plugin: TestPlugin;

	constructor(plugin: TestPlugin) {
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

	public renderMarkdown(_markdown: string, _element: HTMLElement, _filePath: string): Promise<() => void> {
		return Promise.resolve(function () {});
	}

	public executeCommandById(_id: string): boolean {
		return true;
	}

	public jsEngineRunFile(_filePath: string, _callingFilePath: string, _container?: HTMLElement): Promise<() => void> {
		return Promise.reject(new Error('not implemented'));
	}

	public jsEngineRunCode(_code: string, _callingFilePath: string, _container?: HTMLElement): Promise<() => void> {
		return Promise.reject(new Error('not implemented'));
	}

	public openFile(_filePath: string, _callingFilePath: string): void {
		throw new Error('not implemented');
	}

	public getFilePathByName(name: string): string | undefined {
		return name;
	}
}

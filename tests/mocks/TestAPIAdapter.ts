import { IInternalAPI } from '../../src/internalApi/IInternalAPI';
import { DatePickerIPF } from '../../src/fields/inputFields/fields/DatePicker/DatePickerIPF';
import { ImageSuggesterIPF } from '../../src/fields/inputFields/fields/ImageSuggester/ImageSuggesterIPF';
import { SuggesterLikeIFP, SuggesterOption } from '../../src/fields/inputFields/fields/Suggester/SuggesterHelper';
import { MBLiteral } from '../../src/utils/Literal';
import { TestPlugin } from './TestAPI';

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
}

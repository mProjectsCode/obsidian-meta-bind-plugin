import { type SuggesterLikeIFP, type SuggesterOption } from '../fields/inputFields/fields/Suggester/SuggesterHelper';
import { type MBLiteral } from '../utils/Literal';
import { type ImageSuggesterIPF } from '../fields/inputFields/fields/ImageSuggester/ImageSuggesterIPF';
import { type DatePickerIPF } from '../fields/inputFields/fields/DatePicker/DatePickerIPF';

export interface IInternalAPI {
	openTextPromptModal(
		value: string,
		title: string,
		subTitle: string,
		description: string,
		onSubmit: (value: string) => void,
		onCancel: () => void,
	): void;

	openSuggesterModal(
		inputField: SuggesterLikeIFP,
		selectCallback: (selected: SuggesterOption<MBLiteral>) => void,
	): void;

	openImageSuggesterModal(inputField: ImageSuggesterIPF, selectCallback: (selected: string) => void): void;

	openDatePickerModal(inputField: DatePickerIPF): void;

	renderMarkdown(markdown: string, element: HTMLElement, filePath: string): Promise<() => void>;

	executeCommandById(id: string): boolean;

	jsEngineRunFile(filePath: string, callingFilePath: string, container?: HTMLElement): Promise<() => void>;
	jsEngineRunCode(code: string, callingFilePath: string, container?: HTMLElement): Promise<() => void>;

	openFile(filePath: string, callingFilePath: string): void;
}

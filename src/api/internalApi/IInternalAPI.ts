import { type SuggesterLikeIFP, type SuggesterOption } from '../../fields/inputFields/fields/Suggester/SuggesterHelper';
import { type MBLiteral } from '../../utils/Literal';
import { type ImageSuggesterIPF } from '../../fields/inputFields/fields/ImageSuggester/ImageSuggesterIPF';
import { type DatePickerIPF } from '../../fields/inputFields/fields/DatePicker/DatePickerIPF';
import type { ErrorCollection } from '../../utils/errors/ErrorCollection';
import { type IJsRenderer } from '../../fields/viewFields/jsRenderer/IJsRenderer';

export interface ErrorIndicatorProps {
	errorCollection: ErrorCollection;
	code?: string | undefined;
	text?: string | undefined;
	errorText?: string | undefined;
	warningText?: string | undefined;
}

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

	isJsEngineAvailable(): boolean;

	jsEngineRunFile(filePath: string, callingFilePath: string, container?: HTMLElement): Promise<() => void>;

	jsEngineRunCode(code: string, callingFilePath: string, container?: HTMLElement): Promise<() => void>;

	createJsRenderer(container: HTMLElement, filePath: string, code: string): IJsRenderer;

	openFile(filePath: string, callingFilePath: string, newTab: boolean): void;

	getFilePathByName(name: string): string | undefined;

	showNotice(message: string): void;

	createErrorIndicator(element: HTMLElement, props: ErrorIndicatorProps): void;
}

import { ErrorLevel, MetaBindParsingError } from '../../utils/errors/MetaBindErrors';
import { type IPlugin } from '../../IPlugin';
import { ToggleIPF } from './fields/Toggle/ToggleIPF';
import { TextIPF } from './fields/Text/TextIPF';
import { SliderIPF } from './fields/Slider/SliderIPF';
import { TextAreaIPF } from './fields/TextArea/TextAreaIPF';
import { SelectIPF } from './fields/Select/SelectIPF';
import { MultiSelectIPF } from './fields/MultiSelect/MultiSelectIPF';
import { DatePickerIPF } from './fields/DatePicker/DatePickerIPF';
import { NumberIPF } from './fields/Number/NumberIPF';
import { SuggesterIPF } from './fields/Suggester/SuggesterIPF';
import { EditorIPF } from './fields/Editor/EditorIPF';
import { ProgressBarIPF } from './fields/ProgressBar/ProgressBarIPF';
import { InlineSelectIPF } from './fields/InlineSelect/InlineSelectIPF';
import { ImageSuggesterIPF } from './fields/ImageSuggester/ImageSuggesterIPF';
import { ListIPF } from './fields/List/ListIPF';
import { ListSuggesterIPF } from './fields/ListSuggester/ListSuggesterIPF';
import { DateIPF } from './fields/Date/DateIPF';
import { TimeIPF } from './fields/Time/TimeIPF';
import { type InputFieldConfig, InputFieldConfigs, InputFieldType, RenderChildType } from '../../config/FieldConfigs';
import { DocsUtils } from '../../utils/DocsUtils';
import { InlineListSuggesterIPF } from './fields/InlineListSuggester/InlineListSuggesterIPF';
import { InlineListIPF } from './fields/InlineList/InlineListIPF';
import { type IInputFieldBase } from './IInputFieldBase';

export type InputField =
	| ToggleIPF
	| SliderIPF
	| TextIPF
	| TextAreaIPF
	| SelectIPF
	| MultiSelectIPF
	| DatePickerIPF
	| NumberIPF
	| SuggesterIPF
	| EditorIPF
	| ProgressBarIPF
	| InlineSelectIPF
	| ImageSuggesterIPF
	| ListIPF
	| ListSuggesterIPF
	| DateIPF
	| TimeIPF
	| InlineListSuggesterIPF
	| InlineListIPF;

export class InputFieldFactory {
	plugin: IPlugin;

	constructor(plugin: IPlugin) {
		this.plugin = plugin;
	}

	createInputField(
		type: InputFieldType,
		renderChildType: RenderChildType,
		base: IInputFieldBase,
	): InputField | undefined {
		if (type !== InputFieldType.INVALID) {
			this.checkRenderChildTypeAllowed(type, renderChildType);
		}

		// Skipped: Date, Time

		if (type === InputFieldType.TOGGLE) {
			return new ToggleIPF(base);
		} else if (type === InputFieldType.SLIDER) {
			return new SliderIPF(base);
		} else if (type === InputFieldType.TEXT) {
			return new TextIPF(base);
		} else if (type === InputFieldType.TEXT_AREA) {
			return new TextAreaIPF(base);
		} else if (type === InputFieldType.SELECT) {
			return new SelectIPF(base);
		} else if (type === InputFieldType.MULTI_SELECT) {
			return new MultiSelectIPF(base);
		} else if (type === InputFieldType.DATE_PICKER) {
			return new DatePickerIPF(base);
		} else if (type === InputFieldType.NUMBER) {
			return new NumberIPF(base);
		} else if (type === InputFieldType.SUGGESTER) {
			return new SuggesterIPF(base);
		} else if (type === InputFieldType.EDITOR) {
			return new EditorIPF(base);
		} else if (type === InputFieldType.PROGRESS_BAR) {
			return new ProgressBarIPF(base);
		} else if (type === InputFieldType.INLINE_SELECT) {
			return new InlineSelectIPF(base);
		} else if (type === InputFieldType.IMAGE_SUGGESTER) {
			return new ImageSuggesterIPF(base);
		} else if (type === InputFieldType.LIST) {
			return new ListIPF(base);
		} else if (type === InputFieldType.LIST_SUGGESTER) {
			return new ListSuggesterIPF(base);
		} else if (type === InputFieldType.DATE) {
			return new DateIPF(base);
		} else if (type === InputFieldType.TIME) {
			return new TimeIPF(base);
		} else if (type === InputFieldType.INLINE_LIST_SUGGESTER) {
			return new InlineListSuggesterIPF(base);
		} else if (type === InputFieldType.INLINE_LIST) {
			return new InlineListIPF(base);
		}

		return undefined;
	}

	checkRenderChildTypeAllowed(type: InputFieldType, renderChildType: RenderChildType): void {
		if (this.plugin.settings.ignoreCodeBlockRestrictions) {
			return;
		}

		const inputFieldConfig: InputFieldConfig = InputFieldConfigs[type];
		if (renderChildType === RenderChildType.BLOCK && !inputFieldConfig.allowInBlock) {
			throw new MetaBindParsingError({
				errorLevel: ErrorLevel.ERROR,
				effect: 'can not create input field',
				cause: `input fields of type '${type}' are not allowed inside of code blocks`,
				docs: [DocsUtils.linkToInputField(type)],
			});
		}
		if (renderChildType === RenderChildType.INLINE && !inputFieldConfig.allowInline) {
			throw new MetaBindParsingError({
				errorLevel: ErrorLevel.ERROR,
				effect: 'can not create input field',
				cause: `input fields of type '${type}' are not allowed inside of inline code blocks`,
				docs: [DocsUtils.linkToInputField(type)],
			});
		}
	}
}

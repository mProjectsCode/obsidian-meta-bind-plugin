import { type InputFieldConfig, InputFieldConfigs, InputFieldType } from '../../parsers/inputFieldParser/InputFieldConfigs';
import { type InputFieldMDRC, RenderChildType } from '../../renderChildren/InputFieldMDRC';
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

export type NewInputField =
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
	| ListSuggesterIPF;

export class NewInputFieldFactory {
	plugin: IPlugin;

	constructor(plugin: IPlugin) {
		this.plugin = plugin;
	}

	createInputField(type: InputFieldType, renderChildType: RenderChildType, renderChild: InputFieldMDRC): NewInputField | undefined {
		if (type !== InputFieldType.INVALID) {
			this.checkRenderChildTypeAllowed(type, renderChildType);
		}

		// Skipped: Date, Time, List Suggester

		if (type === InputFieldType.TOGGLE) {
			return new ToggleIPF(renderChild);
		} else if (type === InputFieldType.SLIDER) {
			return new SliderIPF(renderChild);
		} else if (type === InputFieldType.TEXT) {
			return new TextIPF(renderChild);
		} else if (type === InputFieldType.TEXT_AREA) {
			return new TextAreaIPF(renderChild);
		} else if (type === InputFieldType.TEXT_AREA_DEPRECATED) {
			return new TextAreaIPF(renderChild);
		} else if (type === InputFieldType.SELECT) {
			return new SelectIPF(renderChild);
		} else if (type === InputFieldType.MULTI_SELECT) {
			return new MultiSelectIPF(renderChild);
		} else if (type === InputFieldType.MULTI_SELECT_DEPRECATED) {
			return new MultiSelectIPF(renderChild);
		} else if (type === InputFieldType.DATE_PICKER) {
			return new DatePickerIPF(renderChild);
		} else if (type === InputFieldType.DATE_PICKER_DEPRECATED) {
			return new DatePickerIPF(renderChild);
		} else if (type === InputFieldType.NUMBER) {
			return new NumberIPF(renderChild);
		} else if (type === InputFieldType.SUGGESTER) {
			return new SuggesterIPF(renderChild);
		} else if (type === InputFieldType.EDITOR) {
			return new EditorIPF(renderChild);
		} else if (type === InputFieldType.PROGRESS_BAR) {
			return new ProgressBarIPF(renderChild);
		} else if (type === InputFieldType.INLINE_SELECT) {
			return new InlineSelectIPF(renderChild);
		} else if (type === InputFieldType.IMAGE_SUGGESTER) {
			return new ImageSuggesterIPF(renderChild);
		} else if (type === InputFieldType.LIST) {
			return new ListIPF(renderChild);
		} else if (type === InputFieldType.LIST_SUGGESTER) {
			return new ListSuggesterIPF(renderChild);
		}

		return undefined;
	}

	checkRenderChildTypeAllowed(type: InputFieldType, renderChildType: RenderChildType): void {
		if (this.plugin.settings.ignoreCodeBlockRestrictions) {
			return;
		}

		const inputFieldConfig: InputFieldConfig = InputFieldConfigs[type];
		if (renderChildType === RenderChildType.BLOCK && !inputFieldConfig.allowInBlock) {
			throw new MetaBindParsingError(ErrorLevel.CRITICAL, 'can not create input field', `'${type}' is not allowed as code block`);
		}
		if (renderChildType === RenderChildType.INLINE && !inputFieldConfig.allowInline) {
			throw new MetaBindParsingError(ErrorLevel.CRITICAL, 'can not create input field', `'${type}' is not allowed as inline code block`);
		}
	}
}

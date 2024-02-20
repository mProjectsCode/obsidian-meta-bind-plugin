import { ErrorLevel, MetaBindParsingError } from 'packages/core/src/utils/errors/MetaBindErrors';
import { type IPlugin } from 'packages/core/src/IPlugin';
import { ToggleIPF } from 'packages/core/src/fields/inputFields/fields/Toggle/ToggleIPF';
import { TextIPF } from 'packages/core/src/fields/inputFields/fields/Text/TextIPF';
import { SliderIPF } from 'packages/core/src/fields/inputFields/fields/Slider/SliderIPF';
import { TextAreaIPF } from 'packages/core/src/fields/inputFields/fields/TextArea/TextAreaIPF';
import { SelectIPF } from 'packages/core/src/fields/inputFields/fields/Select/SelectIPF';
import { MultiSelectIPF } from 'packages/core/src/fields/inputFields/fields/MultiSelect/MultiSelectIPF';
import { DatePickerIPF } from 'packages/core/src/fields/inputFields/fields/DatePicker/DatePickerIPF';
import { NumberIPF } from 'packages/core/src/fields/inputFields/fields/Number/NumberIPF';
import { SuggesterIPF } from 'packages/core/src/fields/inputFields/fields/Suggester/SuggesterIPF';
import { EditorIPF } from 'packages/core/src/fields/inputFields/fields/Editor/EditorIPF';
import { ProgressBarIPF } from 'packages/core/src/fields/inputFields/fields/ProgressBar/ProgressBarIPF';
import { InlineSelectIPF } from 'packages/core/src/fields/inputFields/fields/InlineSelect/InlineSelectIPF';
import { ImageSuggesterIPF } from 'packages/core/src/fields/inputFields/fields/ImageSuggester/ImageSuggesterIPF';
import { ListIPF } from 'packages/core/src/fields/inputFields/fields/List/ListIPF';
import { ListSuggesterIPF } from 'packages/core/src/fields/inputFields/fields/ListSuggester/ListSuggesterIPF';
import { DateIPF } from 'packages/core/src/fields/inputFields/fields/Date/DateIPF';
import { TimeIPF } from 'packages/core/src/fields/inputFields/fields/Time/TimeIPF';
import { type InputFieldConfig, InputFieldConfigs, InputFieldType, RenderChildType } from 'packages/core/src/config/FieldConfigs';
import { DocsUtils } from 'packages/core/src/utils/DocsUtils';
import { InlineListSuggesterIPF } from 'packages/core/src/fields/inputFields/fields/InlineListSuggester/InlineListSuggesterIPF';
import { InlineListIPF } from 'packages/core/src/fields/inputFields/fields/InlineList/InlineListIPF';
import { type InputFieldBase } from 'packages/core/src/fields/inputFields/InputFieldBase';

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

	createInputField(base: InputFieldBase): InputField | undefined {
		const type = base.declaration.inputFieldType;
		const renderChildType = base.renderChildType;

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

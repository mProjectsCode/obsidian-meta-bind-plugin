import type { MetaBind } from 'packages/core/src';
import { RenderChildType } from 'packages/core/src/config/APIConfigs';
import type { InputFieldConfig } from 'packages/core/src/config/FieldConfigs';
import { InputFieldConfigs, InputFieldType } from 'packages/core/src/config/FieldConfigs';
import { DateIPF } from 'packages/core/src/fields/inputFields/fields/Date/DateIPF';
import { DatePickerIPF } from 'packages/core/src/fields/inputFields/fields/DatePicker/DatePickerIPF';
import { DateTimeIPF } from 'packages/core/src/fields/inputFields/fields/DateTime/DateTimeIPF';
import { EditorIPF } from 'packages/core/src/fields/inputFields/fields/Editor/EditorIPF';
import { ImageListSuggesterIPF } from 'packages/core/src/fields/inputFields/fields/ImageListSuggester/ImageListSuggesterIPF';
import { ImageSuggesterIPF } from 'packages/core/src/fields/inputFields/fields/ImageSuggester/ImageSuggesterIPF';
import { InlineListIPF } from 'packages/core/src/fields/inputFields/fields/InlineList/InlineListIPF';
import { InlineListSuggesterIPF } from 'packages/core/src/fields/inputFields/fields/InlineListSuggester/InlineListSuggesterIPF';
import { InlineSelectIPF } from 'packages/core/src/fields/inputFields/fields/InlineSelect/InlineSelectIPF';
import { ListIPF } from 'packages/core/src/fields/inputFields/fields/List/ListIPF';
import { ListSuggesterIPF } from 'packages/core/src/fields/inputFields/fields/ListSuggester/ListSuggesterIPF';
import { MultiSelectIPF } from 'packages/core/src/fields/inputFields/fields/MultiSelect/MultiSelectIPF';
import { NumberIPF } from 'packages/core/src/fields/inputFields/fields/Number/NumberIPF';
import { ProgressBarIPF } from 'packages/core/src/fields/inputFields/fields/ProgressBar/ProgressBarIPF';
import { SelectIPF } from 'packages/core/src/fields/inputFields/fields/Select/SelectIPF';
import { SliderIPF } from 'packages/core/src/fields/inputFields/fields/Slider/SliderIPF';
import { SuggesterIPF } from 'packages/core/src/fields/inputFields/fields/Suggester/SuggesterIPF';
import { TextIPF } from 'packages/core/src/fields/inputFields/fields/Text/TextIPF';
import { TextAreaIPF } from 'packages/core/src/fields/inputFields/fields/TextArea/TextAreaIPF';
import { TimeIPF } from 'packages/core/src/fields/inputFields/fields/Time/TimeIPF';
import { ToggleIPF } from 'packages/core/src/fields/inputFields/fields/Toggle/ToggleIPF';
import type { InputFieldMountable } from 'packages/core/src/fields/inputFields/InputFieldMountable';
import { DocsUtils } from 'packages/core/src/utils/DocsUtils';
import { ErrorLevel, MetaBindParsingError } from 'packages/core/src/utils/errors/MetaBindErrors';
import { expectType } from 'packages/core/src/utils/Utils';

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
	| InlineListIPF
	| ImageListSuggesterIPF
	| DateTimeIPF;

export class InputFieldFactory {
	mb: MetaBind;

	constructor(mb: MetaBind) {
		this.mb = mb;
	}

	createInputField(mountable: InputFieldMountable): InputField | undefined {
		const type = mountable.declaration.inputFieldType;
		const renderChildType = mountable.renderChildType;

		if (type !== InputFieldType.INVALID) {
			this.checkRenderChildTypeAllowed(type, renderChildType);
		}

		// Skipped: Date, Time

		if (type === InputFieldType.TOGGLE) {
			return new ToggleIPF(mountable);
		} else if (type === InputFieldType.SLIDER) {
			return new SliderIPF(mountable);
		} else if (type === InputFieldType.TEXT) {
			return new TextIPF(mountable);
		} else if (type === InputFieldType.TEXT_AREA) {
			return new TextAreaIPF(mountable);
		} else if (type === InputFieldType.SELECT) {
			return new SelectIPF(mountable);
		} else if (type === InputFieldType.MULTI_SELECT) {
			return new MultiSelectIPF(mountable);
		} else if (type === InputFieldType.DATE_PICKER) {
			return new DatePickerIPF(mountable);
		} else if (type === InputFieldType.NUMBER) {
			return new NumberIPF(mountable);
		} else if (type === InputFieldType.SUGGESTER) {
			return new SuggesterIPF(mountable);
		} else if (type === InputFieldType.EDITOR) {
			return new EditorIPF(mountable);
		} else if (type === InputFieldType.PROGRESS_BAR) {
			return new ProgressBarIPF(mountable);
		} else if (type === InputFieldType.INLINE_SELECT) {
			return new InlineSelectIPF(mountable);
		} else if (type === InputFieldType.IMAGE_SUGGESTER) {
			return new ImageSuggesterIPF(mountable);
		} else if (type === InputFieldType.LIST) {
			return new ListIPF(mountable);
		} else if (type === InputFieldType.LIST_SUGGESTER) {
			return new ListSuggesterIPF(mountable);
		} else if (type === InputFieldType.DATE) {
			return new DateIPF(mountable);
		} else if (type === InputFieldType.TIME) {
			return new TimeIPF(mountable);
		} else if (type === InputFieldType.INLINE_LIST_SUGGESTER) {
			return new InlineListSuggesterIPF(mountable);
		} else if (type === InputFieldType.INLINE_LIST) {
			return new InlineListIPF(mountable);
		} else if (type === InputFieldType.IMAGE_LIST_SUGGESTER) {
			return new ImageListSuggesterIPF(mountable);
		} else if (type === InputFieldType.DATE_TIME) {
			return new DateTimeIPF(mountable);
		}

		expectType<InputFieldType.INVALID>(type);

		return undefined;
	}

	checkRenderChildTypeAllowed(type: InputFieldType, renderChildType: RenderChildType): void {
		if (this.mb.getSettings().ignoreCodeBlockRestrictions) {
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

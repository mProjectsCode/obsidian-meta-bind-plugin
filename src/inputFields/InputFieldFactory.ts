import { ToggleInputField } from './fields/ToggleInputField';
import { InputFieldMDRC, RenderChildType } from '../renderChildren/InputFieldMDRC';
import { TextInputField } from './fields/TextInputField';
import { SliderInputField } from './fields/SliderInputField';
import { TextAreaInputField } from './fields/TextAreaInputField';
import { DateInputField } from './fields/DateInputField';
import { TimeInputField } from './fields/TimeInputField';
import { AbstractInputField } from './AbstractInputField';
import { DatePickerInputField } from './fields/DatePicker/DatePickerInputField';
import { NumberInputField } from './fields/NumberInputField';
import { SuggestInputField } from './fields/Suggest/SuggestInputField';
import { ErrorLevel, MetaBindParsingError } from '../utils/errors/MetaBindErrors';
import { EditorInputField } from './fields/Editor/EditorInputField';
import { ImageSuggestInputField } from './fields/ImageSuggest/ImageSuggestInputField';
import MetaBindPlugin from '../main';
import { ProgressBarInputField } from './fields/ProgressBar/ProgressBarInputField';
import { InlineSelectInputField } from './fields/InlineSelectInputField';
import { ListInputField } from './fields/List/ListInputField';
import { InputFieldConfig, InputFieldConfigs, InputFieldType } from './InputFieldConfigs';
import { SelectInputField } from './fields/Select/SelectInputField';
import { MultiSelectInputField } from './fields/Select/MultiSelectInputField';

export class InputFieldFactory {
	static createInputField(
		inputFieldType: InputFieldType,
		args: { renderChildType: RenderChildType; inputFieldMDRC: InputFieldMDRC }
	): AbstractInputField<any> | undefined {
		if (inputFieldType !== InputFieldType.INVALID) {
			InputFieldFactory.checkRenderChildTypeAllowed(inputFieldType, args.renderChildType, args.inputFieldMDRC.plugin);
		}

		if (inputFieldType === InputFieldType.TOGGLE) {
			return new ToggleInputField(args.inputFieldMDRC);
		} else if (inputFieldType === InputFieldType.SLIDER) {
			return new SliderInputField(args.inputFieldMDRC);
		} else if (inputFieldType === InputFieldType.TEXT) {
			return new TextInputField(args.inputFieldMDRC);
		} else if (inputFieldType === InputFieldType.TEXT_AREA_DEPRECATED) {
			return new TextAreaInputField(args.inputFieldMDRC);
		} else if (inputFieldType === InputFieldType.TEXT_AREA) {
			return new TextAreaInputField(args.inputFieldMDRC);
		} else if (inputFieldType === InputFieldType.SELECT) {
			return new SelectInputField(args.inputFieldMDRC);
		} else if (inputFieldType === InputFieldType.MULTI_SELECT_DEPRECATED) {
			return new MultiSelectInputField(args.inputFieldMDRC);
		} else if (inputFieldType === InputFieldType.MULTI_SELECT) {
			return new MultiSelectInputField(args.inputFieldMDRC);
		} else if (inputFieldType === InputFieldType.DATE) {
			return new DateInputField(args.inputFieldMDRC);
		} else if (inputFieldType === InputFieldType.TIME) {
			return new TimeInputField(args.inputFieldMDRC);
		} else if (inputFieldType === InputFieldType.DATE_PICKER_DEPRECATED) {
			return new DatePickerInputField(args.inputFieldMDRC);
		} else if (inputFieldType === InputFieldType.DATE_PICKER) {
			return new DatePickerInputField(args.inputFieldMDRC);
		} else if (inputFieldType === InputFieldType.NUMBER) {
			return new NumberInputField(args.inputFieldMDRC);
		} else if (inputFieldType === InputFieldType.SUGGESTER) {
			return new SuggestInputField(args.inputFieldMDRC);
		} else if (inputFieldType === InputFieldType.EDITOR) {
			return new EditorInputField(args.inputFieldMDRC);
		} else if (inputFieldType === InputFieldType.IMAGE_SUGGESTER) {
			return new ImageSuggestInputField(args.inputFieldMDRC);
		} else if (inputFieldType === InputFieldType.PROGRESS_BAR) {
			return new ProgressBarInputField(args.inputFieldMDRC);
		} else if (inputFieldType === InputFieldType.INLINE_SELECT) {
			return new InlineSelectInputField(args.inputFieldMDRC);
		} else if (inputFieldType === InputFieldType.LIST) {
			return new ListInputField(args.inputFieldMDRC);
		}

		return undefined;
	}

	static checkRenderChildTypeAllowed(inputFieldType: InputFieldType, renderChildType: RenderChildType, plugin: MetaBindPlugin): void {
		if (plugin.settings.ignoreCodeBlockRestrictions) {
			return;
		}

		const inputFieldConfig: InputFieldConfig = InputFieldConfigs[inputFieldType];
		if (renderChildType === RenderChildType.BLOCK && !inputFieldConfig.allowInBlock) {
			throw new MetaBindParsingError(ErrorLevel.CRITICAL, 'can not create input field', `'${inputFieldType}' is not allowed as code block`);
		}
		if (renderChildType === RenderChildType.INLINE && !inputFieldConfig.allowInline) {
			throw new MetaBindParsingError(ErrorLevel.CRITICAL, 'can not create input field', `'${inputFieldType}' is not allowed as inline code block`);
		}
	}
}

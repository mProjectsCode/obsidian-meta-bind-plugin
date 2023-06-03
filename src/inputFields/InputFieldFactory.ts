import { ToggleInputField } from './ToggleInputField';
import { InputFieldMDRC, RenderChildType } from '../renderChildren/InputFieldMDRC';
import { TextInputField } from './TextInputField';
import { SliderInputField } from './SliderInputField';
import { TextAreaInputField } from './TextAreaInputField';
import { SelectInputField } from './SelectInputField';
import { MultiSelectInputField } from './MultiSelectInputField';
import { DateInputField } from './DateInputField';
import { TimeInputField } from './TimeInputField';
import { AbstractInputField } from './AbstractInputField';
import { InputFieldType } from '../parsers/InputFieldDeclarationParser';
import { DatePickerInputField } from './DatePicker/DatePickerInputField';
import { NumberInputField } from './NumberInputField';
import { SuggestInputField } from './Suggest/SuggestInputField';
import { MetaBindParsingError } from '../utils/MetaBindErrors';
import { EditorInputField } from './Editor/EditorInputField';
import { ImageSuggestInputField } from './ImageSuggest/ImageSuggestInputField';
import MetaBindPlugin from '../main';

export class InputFieldFactory {
	static allowCodeBlockMap: Record<string, { block: boolean; inline: boolean }> = {
		[InputFieldType.TOGGLE]: {
			block: ToggleInputField.allowBlock,
			inline: ToggleInputField.allowInline,
		},
		[InputFieldType.SLIDER]: {
			block: SliderInputField.allowBlock,
			inline: SliderInputField.allowInline,
		},
		[InputFieldType.TEXT]: {
			block: TextInputField.allowBlock,
			inline: TextInputField.allowInline,
		},
		[InputFieldType.TEXT_AREA]: {
			block: TextAreaInputField.allowBlock,
			inline: TextAreaInputField.allowInline,
		},
		[InputFieldType.SELECT]: {
			block: SelectInputField.allowBlock,
			inline: SelectInputField.allowInline,
		},
		[InputFieldType.MULTI_SELECT]: {
			block: MultiSelectInputField.allowBlock,
			inline: MultiSelectInputField.allowInline,
		},
		[InputFieldType.DATE]: {
			block: DateInputField.allowBlock,
			inline: DateInputField.allowInline,
		},
		[InputFieldType.TIME]: {
			block: TimeInputField.allowBlock,
			inline: TimeInputField.allowInline,
		},
		[InputFieldType.DATE_PICKER]: {
			block: DatePickerInputField.allowBlock,
			inline: DatePickerInputField.allowInline,
		},
		[InputFieldType.NUMBER]: {
			block: NumberInputField.allowBlock,
			inline: NumberInputField.allowInline,
		},
		[InputFieldType.SUGGESTER]: {
			block: SuggestInputField.allowBlock,
			inline: SuggestInputField.allowInline,
		},
		[InputFieldType.EDITOR]: {
			block: EditorInputField.allowBlock,
			inline: EditorInputField.allowInline,
		},
		[InputFieldType.IMAGE_SUGGESTER]: {
			block: ImageSuggestInputField.allowBlock,
			inline: ImageSuggestInputField.allowInline,
		},
	};

	static createInputField(inputFieldType: InputFieldType, args: { renderChildType: RenderChildType; inputFieldMDRC: InputFieldMDRC }): AbstractInputField | undefined {
		if (inputFieldType !== InputFieldType.INVALID) {
			InputFieldFactory.checkRenderChildTypeAllowed(inputFieldType, args.renderChildType, args.inputFieldMDRC.plugin);
		}

		if (inputFieldType === InputFieldType.TOGGLE) {
			return new ToggleInputField(args.inputFieldMDRC);
		} else if (inputFieldType === InputFieldType.SLIDER) {
			return new SliderInputField(args.inputFieldMDRC);
		} else if (inputFieldType === InputFieldType.TEXT) {
			return new TextInputField(args.inputFieldMDRC);
		} else if (inputFieldType === InputFieldType.TEXT_AREA) {
			return new TextAreaInputField(args.inputFieldMDRC);
		} else if (inputFieldType === InputFieldType.SELECT) {
			return new SelectInputField(args.inputFieldMDRC);
		} else if (inputFieldType === InputFieldType.MULTI_SELECT) {
			return new MultiSelectInputField(args.inputFieldMDRC);
		} else if (inputFieldType === InputFieldType.DATE) {
			return new DateInputField(args.inputFieldMDRC);
		} else if (inputFieldType === InputFieldType.TIME) {
			return new TimeInputField(args.inputFieldMDRC);
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
		}

		return undefined;
	}

	static checkRenderChildTypeAllowed(inputFieldType: InputFieldType, renderChildType: RenderChildType, plugin: MetaBindPlugin): void {
		if (plugin.settings.ignoreCodeBlockRestrictions) {
			return;
		}

		const allowCodeBlock: { block: boolean; inline: boolean } = InputFieldFactory.allowCodeBlockMap[inputFieldType];
		if (renderChildType === RenderChildType.BLOCK && !allowCodeBlock.block) {
			throw new MetaBindParsingError(`'${inputFieldType}' is not allowed as code block`);
		}
		if (renderChildType === RenderChildType.INLINE && !allowCodeBlock.inline) {
			throw new MetaBindParsingError(`'${inputFieldType}' is not allowed as inline code block`);
		}
	}
}

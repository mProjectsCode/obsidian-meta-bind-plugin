import { ToggleInputField } from './ToggleInputField';
import { InputFieldMarkdownRenderChild, InputFieldMarkdownRenderChildType } from '../InputFieldMarkdownRenderChild';
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

export class InputFieldFactory {
	static allowCodeBlockMap: Record<string, { codeBlock: boolean; inlineCodeBlock: boolean }> = {
		[InputFieldType.TOGGLE]: {
			codeBlock: ToggleInputField.allowCodeBlock,
			inlineCodeBlock: ToggleInputField.allowInlineCodeBlock,
		},
		[InputFieldType.SLIDER]: {
			codeBlock: SliderInputField.allowCodeBlock,
			inlineCodeBlock: SliderInputField.allowInlineCodeBlock,
		},
		[InputFieldType.TEXT]: {
			codeBlock: TextInputField.allowCodeBlock,
			inlineCodeBlock: TextInputField.allowInlineCodeBlock,
		},
		[InputFieldType.TEXT_AREA]: {
			codeBlock: TextAreaInputField.allowCodeBlock,
			inlineCodeBlock: TextAreaInputField.allowInlineCodeBlock,
		},
		[InputFieldType.SELECT]: {
			codeBlock: SelectInputField.allowCodeBlock,
			inlineCodeBlock: SelectInputField.allowInlineCodeBlock,
		},
		[InputFieldType.MULTI_SELECT]: {
			codeBlock: MultiSelectInputField.allowCodeBlock,
			inlineCodeBlock: MultiSelectInputField.allowInlineCodeBlock,
		},
		[InputFieldType.DATE]: {
			codeBlock: DateInputField.allowCodeBlock,
			inlineCodeBlock: DateInputField.allowInlineCodeBlock,
		},
		[InputFieldType.TIME]: {
			codeBlock: TimeInputField.allowCodeBlock,
			inlineCodeBlock: TimeInputField.allowInlineCodeBlock,
		},
		[InputFieldType.DATE_PICKER]: {
			codeBlock: DatePickerInputField.allowCodeBlock,
			inlineCodeBlock: DatePickerInputField.allowInlineCodeBlock,
		},
		[InputFieldType.NUMBER]: {
			codeBlock: NumberInputField.allowCodeBlock,
			inlineCodeBlock: NumberInputField.allowInlineCodeBlock,
		},
		[InputFieldType.SUGGESTER]: {
			codeBlock: SuggestInputField.allowCodeBlock,
			inlineCodeBlock: SuggestInputField.allowInlineCodeBlock,
		},
	};

	static createInputField(
		inputFieldType: InputFieldType,
		args: { type: InputFieldMarkdownRenderChildType; inputFieldMarkdownRenderChild: InputFieldMarkdownRenderChild; onValueChanged: (value: any) => void | Promise<void> }
	): AbstractInputField | undefined {
		if (inputFieldType === InputFieldType.TOGGLE) {
			InputFieldFactory.checkInputFieldMarkdownRenderChildTypeAllowed(inputFieldType, args.type);
			return new ToggleInputField(args.inputFieldMarkdownRenderChild, args.onValueChanged);
		} else if (inputFieldType === InputFieldType.SLIDER) {
			InputFieldFactory.checkInputFieldMarkdownRenderChildTypeAllowed(inputFieldType, args.type);
			return new SliderInputField(args.inputFieldMarkdownRenderChild, args.onValueChanged);
		} else if (inputFieldType === InputFieldType.TEXT) {
			InputFieldFactory.checkInputFieldMarkdownRenderChildTypeAllowed(inputFieldType, args.type);
			return new TextInputField(args.inputFieldMarkdownRenderChild, args.onValueChanged);
		} else if (inputFieldType === InputFieldType.TEXT_AREA) {
			InputFieldFactory.checkInputFieldMarkdownRenderChildTypeAllowed(inputFieldType, args.type);
			return new TextAreaInputField(args.inputFieldMarkdownRenderChild, args.onValueChanged);
		} else if (inputFieldType === InputFieldType.SELECT) {
			InputFieldFactory.checkInputFieldMarkdownRenderChildTypeAllowed(inputFieldType, args.type);
			return new SelectInputField(args.inputFieldMarkdownRenderChild, args.onValueChanged);
		} else if (inputFieldType === InputFieldType.MULTI_SELECT) {
			InputFieldFactory.checkInputFieldMarkdownRenderChildTypeAllowed(inputFieldType, args.type);
			return new MultiSelectInputField(args.inputFieldMarkdownRenderChild, args.onValueChanged);
		} else if (inputFieldType === InputFieldType.DATE) {
			InputFieldFactory.checkInputFieldMarkdownRenderChildTypeAllowed(inputFieldType, args.type);
			return new DateInputField(args.inputFieldMarkdownRenderChild, args.onValueChanged);
		} else if (inputFieldType === InputFieldType.TIME) {
			InputFieldFactory.checkInputFieldMarkdownRenderChildTypeAllowed(inputFieldType, args.type);
			return new TimeInputField(args.inputFieldMarkdownRenderChild, args.onValueChanged);
		} else if (inputFieldType === InputFieldType.DATE_PICKER) {
			InputFieldFactory.checkInputFieldMarkdownRenderChildTypeAllowed(inputFieldType, args.type);
			return new DatePickerInputField(args.inputFieldMarkdownRenderChild, args.onValueChanged);
		} else if (inputFieldType === InputFieldType.NUMBER) {
			InputFieldFactory.checkInputFieldMarkdownRenderChildTypeAllowed(inputFieldType, args.type);
			return new NumberInputField(args.inputFieldMarkdownRenderChild, args.onValueChanged);
		} else if (inputFieldType === InputFieldType.SUGGESTER) {
			InputFieldFactory.checkInputFieldMarkdownRenderChildTypeAllowed(inputFieldType, args.type);
			return new SuggestInputField(args.inputFieldMarkdownRenderChild, args.onValueChanged);
		}

		return undefined;
	}

	static checkInputFieldMarkdownRenderChildTypeAllowed(inputFieldType: InputFieldType, type: InputFieldMarkdownRenderChildType): void {
		const allowCodeBlock: { codeBlock: boolean; inlineCodeBlock: boolean } = InputFieldFactory.allowCodeBlockMap[inputFieldType];
		if (type === InputFieldMarkdownRenderChildType.CODE_BLOCK && !allowCodeBlock.codeBlock) {
			throw new MetaBindParsingError(`'${inputFieldType}' is not allowed as code block`);
		}
		if (type === InputFieldMarkdownRenderChildType.INLINE_CODE_BLOCK && !allowCodeBlock.inlineCodeBlock) {
			throw new MetaBindParsingError(`'${inputFieldType}' is not allowed as inline code block`);
		}
	}
}

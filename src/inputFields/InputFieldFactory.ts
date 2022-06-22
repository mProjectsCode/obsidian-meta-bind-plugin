import {AbstractInputField} from './AbstractInputField';
import {ToggleInputField} from './ToggleInputField';
import {InputFieldMarkdownRenderChild, InputFieldMarkdownRenderChildType} from '../InputFieldMarkdownRenderChild';
import {TextInputField} from './TextInputField';
import {SliderInputField} from './SliderInputField';
import {TextAreaInputField} from './TextAreaInputField';
import {SelectInputField} from './SelectInputField';
import {MultiSelectInputField} from './MultiSelectInputField';
import {DateInputField} from './DateInputField';

export enum InputFieldType {
	TOGGLE = 'toggle',
	SLIDER = 'slider',
	TEXT = 'text',
	TEXT_AREA = 'text_area',
	SELECT = 'select',
	MULTI_SELECT = 'multi_select',
	DATE = 'date',
	INVALID = 'invalid',
}

export class InputFieldFactory {
	static createInputField(inputFieldType: InputFieldType, args: { type: InputFieldMarkdownRenderChildType, inputFieldMarkdownRenderChild: InputFieldMarkdownRenderChild, onValueChanged: (value: any) => void | Promise<void> }): AbstractInputField {
		if (inputFieldType === InputFieldType.TOGGLE) {
			if (args.type === InputFieldMarkdownRenderChildType.CODE_BLOCK && !ToggleInputField.allowCodeBlock) {
				throw new Error(`can not create ${inputFieldType} as code block`);
			}
			if (args.type === InputFieldMarkdownRenderChildType.INLINE_CODE_BLOCK && !ToggleInputField.allowInlineCodeBlock) {
				throw new Error(`can not create ${inputFieldType} as inline code block`);
			}
			return new ToggleInputField(args.inputFieldMarkdownRenderChild, args.onValueChanged);
		} else if (inputFieldType === InputFieldType.SLIDER) {
			if (args.type === InputFieldMarkdownRenderChildType.CODE_BLOCK && !SliderInputField.allowCodeBlock) {
				throw new Error(`can not create ${inputFieldType} as code block`);
			}
			if (args.type === InputFieldMarkdownRenderChildType.INLINE_CODE_BLOCK && !SliderInputField.allowInlineCodeBlock) {
				throw new Error(`can not create ${inputFieldType} as inline code block`);
			}
			return new SliderInputField(args.inputFieldMarkdownRenderChild, args.onValueChanged);
		} else if (inputFieldType === InputFieldType.TEXT) {
			if (args.type === InputFieldMarkdownRenderChildType.CODE_BLOCK && !TextInputField.allowCodeBlock) {
				throw new Error(`can not create ${inputFieldType} as code block`);
			}
			if (args.type === InputFieldMarkdownRenderChildType.INLINE_CODE_BLOCK && !TextInputField.allowInlineCodeBlock) {
				throw new Error(`can not create ${inputFieldType} as inline code block`);
			}
			return new TextInputField(args.inputFieldMarkdownRenderChild, args.onValueChanged);
		} else if (inputFieldType === InputFieldType.TEXT_AREA) {
			if (args.type === InputFieldMarkdownRenderChildType.CODE_BLOCK && !TextAreaInputField.allowCodeBlock) {
				throw new Error(`can not create ${inputFieldType} as code block`);
			}
			if (args.type === InputFieldMarkdownRenderChildType.INLINE_CODE_BLOCK && !TextAreaInputField.allowInlineCodeBlock) {
				throw new Error(`can not create ${inputFieldType} as inline code block`);
			}
			return new TextAreaInputField(args.inputFieldMarkdownRenderChild, args.onValueChanged);
		} else if (inputFieldType === InputFieldType.SELECT) {
			if (args.type === InputFieldMarkdownRenderChildType.CODE_BLOCK && !SelectInputField.allowCodeBlock) {
				throw new Error(`can not create ${inputFieldType} as code block`);
			}
			if (args.type === InputFieldMarkdownRenderChildType.INLINE_CODE_BLOCK && !SelectInputField.allowInlineCodeBlock) {
				throw new Error(`can not create ${inputFieldType} as inline code block`);
			}
			return new SelectInputField(args.inputFieldMarkdownRenderChild, args.onValueChanged);
		} else if (inputFieldType === InputFieldType.MULTI_SELECT) {
			if (args.type === InputFieldMarkdownRenderChildType.CODE_BLOCK && !MultiSelectInputField.allowCodeBlock) {
				throw new Error(`can not create ${inputFieldType} as code block`);
			}
			if (args.type === InputFieldMarkdownRenderChildType.INLINE_CODE_BLOCK && !MultiSelectInputField.allowInlineCodeBlock) {
				throw new Error(`can not create ${inputFieldType} as inline code block`);
			}
			return new MultiSelectInputField(args.inputFieldMarkdownRenderChild, args.onValueChanged);
		} else if (inputFieldType === InputFieldType.DATE) {
			if (args.type === InputFieldMarkdownRenderChildType.CODE_BLOCK && !DateInputField.allowCodeBlock) {
				throw new Error(`can not create ${inputFieldType} as code block`);
			}
			if (args.type === InputFieldMarkdownRenderChildType.INLINE_CODE_BLOCK && !DateInputField.allowInlineCodeBlock) {
				throw new Error(`can not create ${inputFieldType} as inline code block`);
			}
			return new DateInputField(args.inputFieldMarkdownRenderChild, args.onValueChanged);
		}

		return null;
	}

	static getInputFieldType(str: string): InputFieldType {
		for (const entry of Object.entries(InputFieldType)) {
			if (entry[1] === str) {
				return entry[1];
			}
		}

		return InputFieldType.INVALID;
	}

}

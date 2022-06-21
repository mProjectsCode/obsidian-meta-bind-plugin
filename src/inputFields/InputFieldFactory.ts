import {AbstractInputField} from './AbstractInputField';
import {ToggleInputField} from './ToggleInputField';
import {InputFieldMarkdownRenderChild} from '../InputFieldMarkdownRenderChild';
import {TextInputField} from './TextInputField';
import {SliderInputField} from './SliderInputField';
import {TextAreaInputField} from './TextAreaInputField';

export enum InputFieldType {
	TOGGLE = 'toggle',
	SLIDER = 'slider',
	TEXT = 'text',
	TEXT_AREA = 'text_area',
	INVALID = 'invalid',
}

export class InputFieldFactory {
	static createInputField(inputFieldType: InputFieldType, args: { inputFieldMarkdownRenderChild: InputFieldMarkdownRenderChild, onValueChanged: (value: any) => void | Promise<void> }): AbstractInputField {
		if (inputFieldType === InputFieldType.TOGGLE) {
			return new ToggleInputField(args.inputFieldMarkdownRenderChild, args.onValueChanged);
		} else if (inputFieldType === InputFieldType.SLIDER) {
			return new SliderInputField(args.inputFieldMarkdownRenderChild, args.onValueChanged);
		} else if (inputFieldType === InputFieldType.TEXT) {
			return new TextInputField(args.inputFieldMarkdownRenderChild, args.onValueChanged);
		} else if (inputFieldType === InputFieldType.TEXT_AREA) {
			return new TextAreaInputField(args.inputFieldMarkdownRenderChild, args.onValueChanged);
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

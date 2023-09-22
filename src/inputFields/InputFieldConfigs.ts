import { InputFieldType } from '../parsers/InputFieldDeclarationParser';

export interface InputFieldConfig {
	type: InputFieldType;
	allowInBlock: boolean;
	allowInline: boolean;
}

export const InputFieldConfigs: Record<InputFieldType, InputFieldConfig> = {
	[InputFieldType.TOGGLE]: {
		type: InputFieldType.TOGGLE,
		allowInBlock: true,
		allowInline: true,
	},
	[InputFieldType.SLIDER]: {
		type: InputFieldType.SLIDER,
		allowInBlock: true,
		allowInline: true,
	},
	[InputFieldType.TEXT]: {
		type: InputFieldType.TEXT,
		allowInBlock: true,
		allowInline: true,
	},
	[InputFieldType.TEXT_AREA_DEPRECATED]: {
		type: InputFieldType.TEXT_AREA_DEPRECATED,
		allowInBlock: true,
		allowInline: true,
	},
	[InputFieldType.TEXT_AREA]: {
		type: InputFieldType.TEXT_AREA,
		allowInBlock: true,
		allowInline: true,
	},
	[InputFieldType.SELECT]: {
		type: InputFieldType.SELECT,
		allowInBlock: true,
		allowInline: false,
	},
	[InputFieldType.MULTI_SELECT_DEPRECATED]: {
		type: InputFieldType.MULTI_SELECT_DEPRECATED,
		allowInBlock: true,
		allowInline: false,
	},
	[InputFieldType.MULTI_SELECT]: {
		type: InputFieldType.MULTI_SELECT,
		allowInBlock: true,
		allowInline: false,
	},
	[InputFieldType.DATE]: {
		type: InputFieldType.DATE,
		allowInBlock: true,
		allowInline: true,
	},
	[InputFieldType.TIME]: {
		type: InputFieldType.TIME,
		allowInBlock: true,
		allowInline: true,
	},
	[InputFieldType.DATE_PICKER_DEPRECATED]: {
		type: InputFieldType.DATE_PICKER_DEPRECATED,
		allowInBlock: true,
		allowInline: true,
	},
	[InputFieldType.DATE_PICKER]: {
		type: InputFieldType.DATE_PICKER,
		allowInBlock: true,
		allowInline: true,
	},
	[InputFieldType.NUMBER]: {
		type: InputFieldType.NUMBER,
		allowInBlock: true,
		allowInline: true,
	},
	[InputFieldType.SUGGESTER]: {
		type: InputFieldType.SUGGESTER,
		allowInBlock: true,
		allowInline: true,
	},
	[InputFieldType.EDITOR]: {
		type: InputFieldType.EDITOR,
		allowInBlock: true,
		allowInline: false,
	},
	[InputFieldType.IMAGE_SUGGESTER]: {
		type: InputFieldType.IMAGE_SUGGESTER,
		allowInBlock: true,
		allowInline: false,
	},
	[InputFieldType.PROGRESS_BAR]: {
		type: InputFieldType.PROGRESS_BAR,
		allowInBlock: true,
		allowInline: false,
	},
	[InputFieldType.INLINE_SELECT]: {
		type: InputFieldType.INLINE_SELECT,
		allowInBlock: false,
		allowInline: true,
	},
	[InputFieldType.LIST]: {
		type: InputFieldType.LIST,
		allowInBlock: true,
		allowInline: false,
	},
	[InputFieldType.INVALID]: {
		type: InputFieldType.INVALID,
		allowInBlock: false,
		allowInline: false,
	},
} as const;

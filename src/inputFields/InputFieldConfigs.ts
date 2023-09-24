export enum InputFieldType {
	TOGGLE = 'toggle',
	SLIDER = 'slider',
	TEXT = 'text',
	TEXT_AREA_DEPRECATED = 'text_area',
	TEXT_AREA = 'textArea',
	SELECT = 'select',
	MULTI_SELECT_DEPRECATED = 'multi_select',
	MULTI_SELECT = 'multiSelect',
	DATE = 'date',
	TIME = 'time',
	DATE_PICKER_DEPRECATED = 'date_picker',
	DATE_PICKER = 'datePicker',
	NUMBER = 'number',
	SUGGESTER = 'suggester',
	EDITOR = 'editor',
	IMAGE_SUGGESTER = 'imageSuggester',
	PROGRESS_BAR = 'progressBar',
	INLINE_SELECT = 'inlineSelect',
	LIST = 'list',

	INVALID = 'invalid',
}

export enum InputFieldArgumentType {
	CLASS = 'class',
	ADD_LABELS = 'addLabels',
	MIN_VALUE = 'minValue',
	MAX_VALUE = 'maxValue',
	OPTION = 'option',
	TITLE = 'title',
	OPTION_QUERY = 'optionQuery',
	SHOWCASE = 'showcase',
	ON_VALUE = 'onValue',
	OFF_VALUE = 'offValue',
	DEFAULT_VALUE = 'defaultValue',
	PLACEHOLDER = 'placeholder',

	INVALID = 'invalid',
}

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
		allowInBlock: true,
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

export interface InputFieldArgumentConfig {
	type: InputFieldArgumentType;
	allowedInputFieldTypes: InputFieldType[];
	valueLengthMin: number;
	valueLengthMax: number;
	allowMultiple: boolean;
}

export const InputFieldArgumentConfigs: Record<InputFieldArgumentType, InputFieldArgumentConfig> = {
	[InputFieldArgumentType.ADD_LABELS]: {
		type: InputFieldArgumentType.ADD_LABELS,
		allowedInputFieldTypes: [InputFieldType.SLIDER, InputFieldType.PROGRESS_BAR],
		valueLengthMin: 0,
		valueLengthMax: 1,
		allowMultiple: false,
	},
	[InputFieldArgumentType.CLASS]: {
		type: InputFieldArgumentType.CLASS,
		allowedInputFieldTypes: [],
		valueLengthMin: 1,
		valueLengthMax: 1,
		allowMultiple: true,
	},
	[InputFieldArgumentType.DEFAULT_VALUE]: {
		type: InputFieldArgumentType.DEFAULT_VALUE,
		allowedInputFieldTypes: [],
		valueLengthMin: 1,
		valueLengthMax: 1,
		allowMultiple: false,
	},
	[InputFieldArgumentType.MAX_VALUE]: {
		type: InputFieldArgumentType.MAX_VALUE,
		allowedInputFieldTypes: [InputFieldType.SLIDER, InputFieldType.PROGRESS_BAR],
		valueLengthMin: 1,
		valueLengthMax: 1,
		allowMultiple: false,
	},
	[InputFieldArgumentType.MIN_VALUE]: {
		type: InputFieldArgumentType.MIN_VALUE,
		allowedInputFieldTypes: [InputFieldType.SLIDER, InputFieldType.PROGRESS_BAR],
		valueLengthMin: 1,
		valueLengthMax: 1,
		allowMultiple: false,
	},
	[InputFieldArgumentType.OFF_VALUE]: {
		type: InputFieldArgumentType.OFF_VALUE,
		allowedInputFieldTypes: [InputFieldType.TOGGLE],
		valueLengthMin: 1,
		valueLengthMax: 1,
		allowMultiple: false,
	},
	[InputFieldArgumentType.ON_VALUE]: {
		type: InputFieldArgumentType.ON_VALUE,
		allowedInputFieldTypes: [InputFieldType.TOGGLE],
		valueLengthMin: 1,
		valueLengthMax: 1,
		allowMultiple: false,
	},
	[InputFieldArgumentType.OPTION]: {
		type: InputFieldArgumentType.OPTION,
		allowedInputFieldTypes: [
			InputFieldType.SELECT,
			InputFieldType.MULTI_SELECT_DEPRECATED,
			InputFieldType.MULTI_SELECT,
			InputFieldType.SUGGESTER,
			InputFieldType.IMAGE_SUGGESTER,
			InputFieldType.INLINE_SELECT,
		],
		valueLengthMin: 1,
		valueLengthMax: 2,
		allowMultiple: true,
	},

	[InputFieldArgumentType.OPTION_QUERY]: {
		type: InputFieldArgumentType.OPTION_QUERY,
		allowedInputFieldTypes: [InputFieldType.SUGGESTER, InputFieldType.IMAGE_SUGGESTER],
		valueLengthMin: 1,
		valueLengthMax: 1,
		allowMultiple: true,
	},
	[InputFieldArgumentType.PLACEHOLDER]: {
		type: InputFieldArgumentType.PLACEHOLDER,
		allowedInputFieldTypes: [
			InputFieldType.TEXT,
			InputFieldType.TEXT_AREA,
			InputFieldType.TEXT_AREA_DEPRECATED,
			InputFieldType.NUMBER,
			InputFieldType.LIST,
		],
		valueLengthMin: 1,
		valueLengthMax: 1,
		allowMultiple: false,
	},

	[InputFieldArgumentType.SHOWCASE]: {
		type: InputFieldArgumentType.SHOWCASE,
		allowedInputFieldTypes: [],
		valueLengthMin: 0,
		valueLengthMax: 1,
		allowMultiple: false,
	},
	[InputFieldArgumentType.TITLE]: {
		type: InputFieldArgumentType.TITLE,
		allowedInputFieldTypes: [],
		valueLengthMin: 0,
		valueLengthMax: 1,
		allowMultiple: false,
	},
	[InputFieldArgumentType.INVALID]: {
		type: InputFieldArgumentType.INVALID,
		allowedInputFieldTypes: [],
		valueLengthMin: 0,
		valueLengthMax: 0,
		allowMultiple: true,
	},
};

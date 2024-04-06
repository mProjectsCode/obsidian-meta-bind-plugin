import type {
	SimpleJsViewFieldDeclaration,
	SimpleViewFieldDeclaration,
} from 'packages/core/src/parsers/viewFieldParser/ViewFieldDeclaration';
import type { BindTargetScope } from 'packages/core/src/metadata/BindTargetScope';
import type { SimpleInputFieldDeclaration } from 'packages/core/src/parsers/inputFieldParser/InputFieldDeclaration';
import type { ButtonConfig } from 'packages/core/src/config/ButtonConfig';
import type { SimpleButtonGroupDeclaration } from 'packages/core/src/parsers/ButtonParser';
import { type BindTargetDeclaration } from 'packages/core/src/parsers/bindTargetParser/BindTargetDeclaration';
import { type MetaBindColumnDeclaration } from 'packages/core/src/fields/metaBindTable/TableMountable';

export interface FieldArgumentValueConfig {
	name: string;
	// empty is any
	allowed: string[];
	description: string;
}

export interface FieldArgumentConfig<ArgumentType extends string, FieldType extends string> {
	type: ArgumentType;
	allowedFieldTypes: FieldType[];
	values: FieldArgumentValueConfig[][];
	allowMultiple: boolean;
}

// --- INPUT FIELDS ---

export enum InputFieldType {
	TOGGLE = 'toggle',
	SLIDER = 'slider',
	TEXT = 'text',
	TEXT_AREA = 'textArea',
	SELECT = 'select',
	MULTI_SELECT = 'multiSelect',
	DATE = 'date',
	TIME = 'time',
	DATE_PICKER = 'datePicker',
	NUMBER = 'number',
	SUGGESTER = 'suggester',
	EDITOR = 'editor',
	IMAGE_SUGGESTER = 'imageSuggester',
	PROGRESS_BAR = 'progressBar',
	INLINE_SELECT = 'inlineSelect',
	LIST = 'list',
	LIST_SUGGESTER = 'listSuggester',
	INLINE_LIST_SUGGESTER = 'inlineListSuggester',
	INLINE_LIST = 'inlineList',
	IMAGE_LIST_SUGGESTER = 'imageListSuggester',
	DATE_TIME = 'dateTime',

	INVALID = 'invalid',
}

export enum InputFieldArgumentType {
	CLASS = 'class',
	ADD_LABELS = 'addLabels',
	MIN_VALUE = 'minValue',
	MAX_VALUE = 'maxValue',
	STEP_SIZE = 'stepSize',
	OPTION = 'option',
	TITLE = 'title',
	OPTION_QUERY = 'optionQuery',
	SHOWCASE = 'showcase',
	ON_VALUE = 'onValue',
	OFF_VALUE = 'offValue',
	DEFAULT_VALUE = 'defaultValue',
	PLACEHOLDER = 'placeholder',
	USE_LINKS = 'useLinks',
	LIMIT = 'limit',
	MULTI_LINE = 'multiLine',
	ALLOW_OTHER = 'allowOther',

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
	[InputFieldType.LIST_SUGGESTER]: {
		type: InputFieldType.LIST_SUGGESTER,
		allowInBlock: true,
		allowInline: false,
	},
	[InputFieldType.INLINE_LIST_SUGGESTER]: {
		type: InputFieldType.INLINE_LIST_SUGGESTER,
		allowInBlock: true,
		allowInline: true,
	},
	[InputFieldType.INLINE_LIST]: {
		type: InputFieldType.INLINE_LIST,
		allowInBlock: true,
		allowInline: true,
	},
	[InputFieldType.IMAGE_LIST_SUGGESTER]: {
		type: InputFieldType.IMAGE_LIST_SUGGESTER,
		allowInBlock: true,
		allowInline: false,
	},
	[InputFieldType.DATE_TIME]: {
		type: InputFieldType.DATE_TIME,
		allowInBlock: true,
		allowInline: true,
	},
	[InputFieldType.INVALID]: {
		type: InputFieldType.INVALID,
		allowInBlock: false,
		allowInline: false,
	},
} as const;

export enum UseLinksInputFieldArgumentValue {
	TRUE = 'true',
	PARTIAL = 'partial',
	FALSE = 'false',
}

export type InputFieldArgumentConfig = FieldArgumentConfig<InputFieldArgumentType, InputFieldType>;

export const InputFieldArgumentConfigs: Record<InputFieldArgumentType, InputFieldArgumentConfig> = {
	[InputFieldArgumentType.ADD_LABELS]: {
		type: InputFieldArgumentType.ADD_LABELS,
		allowedFieldTypes: [InputFieldType.SLIDER, InputFieldType.PROGRESS_BAR],
		values: [
			[],
			[
				{
					name: 'value',
					allowed: ['true', 'false'],
					description: '',
				},
			],
		],
		allowMultiple: false,
	},
	[InputFieldArgumentType.CLASS]: {
		type: InputFieldArgumentType.CLASS,
		allowedFieldTypes: [],
		values: [
			[
				{
					name: 'className',
					allowed: [],
					description: 'the name of the css class to add',
				},
			],
		],
		allowMultiple: true,
	},
	[InputFieldArgumentType.DEFAULT_VALUE]: {
		type: InputFieldArgumentType.DEFAULT_VALUE,
		allowedFieldTypes: [],
		values: [
			[
				{
					name: 'value',
					allowed: [],
					description: '',
				},
			],
		],
		allowMultiple: false,
	},
	[InputFieldArgumentType.MAX_VALUE]: {
		type: InputFieldArgumentType.MAX_VALUE,
		allowedFieldTypes: [InputFieldType.SLIDER, InputFieldType.PROGRESS_BAR],
		values: [
			[
				{
					name: 'value',
					allowed: ['number'],
					description: 'the maximally allowed value',
				},
			],
		],
		allowMultiple: false,
	},
	[InputFieldArgumentType.MIN_VALUE]: {
		type: InputFieldArgumentType.MIN_VALUE,
		allowedFieldTypes: [InputFieldType.SLIDER, InputFieldType.PROGRESS_BAR],
		values: [
			[
				{
					name: 'value',
					allowed: ['number'],
					description: 'the minimally allowed value',
				},
			],
		],
		allowMultiple: false,
	},
	[InputFieldArgumentType.STEP_SIZE]: {
		type: InputFieldArgumentType.STEP_SIZE,
		allowedFieldTypes: [InputFieldType.SLIDER, InputFieldType.PROGRESS_BAR],
		values: [
			[
				{
					name: 'value',
					allowed: ['number'],
					description: 'the step size for sliders',
				},
			],
		],
		allowMultiple: false,
	},
	[InputFieldArgumentType.OFF_VALUE]: {
		type: InputFieldArgumentType.OFF_VALUE,
		allowedFieldTypes: [InputFieldType.TOGGLE],
		values: [
			[
				{
					name: 'value',
					allowed: [],
					description: 'the value for the off state',
				},
			],
		],
		allowMultiple: false,
	},
	[InputFieldArgumentType.ON_VALUE]: {
		type: InputFieldArgumentType.ON_VALUE,
		allowedFieldTypes: [InputFieldType.TOGGLE],
		values: [
			[
				{
					name: 'value',
					allowed: [],
					description: 'the value for the off state',
				},
			],
		],
		allowMultiple: false,
	},
	[InputFieldArgumentType.OPTION]: {
		type: InputFieldArgumentType.OPTION,
		allowedFieldTypes: [
			InputFieldType.SELECT,
			InputFieldType.MULTI_SELECT,
			InputFieldType.SUGGESTER,
			InputFieldType.IMAGE_SUGGESTER,
			InputFieldType.INLINE_SELECT,
			InputFieldType.LIST_SUGGESTER,
			InputFieldType.INLINE_LIST_SUGGESTER,
			InputFieldType.IMAGE_LIST_SUGGESTER,
		],
		values: [
			[
				{
					name: 'value',
					allowed: [],
					description: 'the value and display name of the option',
				},
			],
			[
				{
					name: 'value',
					allowed: [],
					description: 'the value of the option',
				},
				{
					name: 'name',
					allowed: [],
					description: 'the display name of the option',
				},
			],
		],
		allowMultiple: true,
	},
	[InputFieldArgumentType.OPTION_QUERY]: {
		type: InputFieldArgumentType.OPTION_QUERY,
		allowedFieldTypes: [
			InputFieldType.SUGGESTER,
			InputFieldType.IMAGE_SUGGESTER,
			InputFieldType.LIST_SUGGESTER,
			InputFieldType.INLINE_LIST_SUGGESTER,
			InputFieldType.IMAGE_LIST_SUGGESTER,
		],
		values: [
			[
				{
					name: 'value',
					allowed: [],
					description: 'the query for options',
				},
			],
		],
		allowMultiple: true,
	},
	[InputFieldArgumentType.PLACEHOLDER]: {
		type: InputFieldArgumentType.PLACEHOLDER,
		allowedFieldTypes: [
			InputFieldType.TEXT,
			InputFieldType.TEXT_AREA,
			InputFieldType.NUMBER,
			InputFieldType.LIST,
			InputFieldType.INLINE_LIST,
		],
		values: [
			[
				{
					name: 'value',
					allowed: [],
					description: '',
				},
			],
		],
		allowMultiple: false,
	},

	[InputFieldArgumentType.SHOWCASE]: {
		type: InputFieldArgumentType.SHOWCASE,
		allowedFieldTypes: [],
		values: [
			[],
			[
				{
					name: 'value',
					allowed: ['true', 'false'],
					description: '',
				},
			],
		],
		allowMultiple: false,
	},
	[InputFieldArgumentType.TITLE]: {
		type: InputFieldArgumentType.TITLE,
		allowedFieldTypes: [],
		values: [
			[
				{
					name: 'value',
					allowed: [],
					description: '',
				},
			],
		],
		allowMultiple: false,
	},
	[InputFieldArgumentType.USE_LINKS]: {
		type: InputFieldArgumentType.USE_LINKS,
		allowedFieldTypes: [
			InputFieldType.SUGGESTER,
			InputFieldType.LIST_SUGGESTER,
			InputFieldType.INLINE_LIST_SUGGESTER,
		],
		values: [
			[],
			[
				{
					name: 'value',
					allowed: [
						UseLinksInputFieldArgumentValue.TRUE,
						UseLinksInputFieldArgumentValue.PARTIAL,
						UseLinksInputFieldArgumentValue.FALSE,
					],
					description: '',
				},
			],
		],
		allowMultiple: false,
	},
	[InputFieldArgumentType.LIMIT]: {
		type: InputFieldArgumentType.LIMIT,
		allowedFieldTypes: [
			InputFieldType.TEXT,
			InputFieldType.TEXT_AREA,
			InputFieldType.LIST,
			InputFieldType.INLINE_LIST,
		],
		values: [
			[
				{
					name: 'value',
					allowed: ['number'],
					description: 'a character limit for text fields',
				},
			],
		],
		allowMultiple: false,
	},
	[InputFieldArgumentType.MULTI_LINE]: {
		type: InputFieldArgumentType.MULTI_LINE,
		allowedFieldTypes: [InputFieldType.LIST],
		values: [
			[],
			[
				{
					name: 'value',
					allowed: ['true', 'false'],
					description: '',
				},
			],
		],
		allowMultiple: false,
	},
	[InputFieldArgumentType.ALLOW_OTHER]: {
		type: InputFieldArgumentType.ALLOW_OTHER,
		allowedFieldTypes: [
			InputFieldType.SUGGESTER,
			InputFieldType.LIST_SUGGESTER,
			InputFieldType.INLINE_LIST_SUGGESTER,
		],
		values: [
			[],
			[
				{
					name: 'value',
					allowed: ['true', 'false'],
					description: '',
				},
			],
		],
		allowMultiple: false,
	},
	[InputFieldArgumentType.INVALID]: {
		type: InputFieldArgumentType.INVALID,
		allowedFieldTypes: [],
		values: [[]],
		allowMultiple: true,
	},
};

// --- VIEW FIELDS ---

export enum ViewFieldType {
	MATH = 'math',
	TEXT = 'text',
	LINK = 'link',
	IMAGE = 'image',

	INVALID = 'invalid',
}

export enum ViewFieldArgumentType {
	RENDER_MARKDOWN = 'renderMarkdown',
	HIDDEN = 'hidden',
	CLASS = 'class',

	INVALID = 'invalid',
}

export type ViewFieldArgumentConfig = FieldArgumentConfig<ViewFieldArgumentType, ViewFieldType>;

export const ViewFieldArgumentConfigs: Record<ViewFieldArgumentType, ViewFieldArgumentConfig> = {
	[ViewFieldArgumentType.RENDER_MARKDOWN]: {
		type: ViewFieldArgumentType.RENDER_MARKDOWN,
		allowedFieldTypes: [ViewFieldType.TEXT],
		values: [
			[],
			[
				{
					name: 'value',
					allowed: ['true', 'false'],
					description: '',
				},
			],
		],
		allowMultiple: false,
	},
	[ViewFieldArgumentType.HIDDEN]: {
		type: ViewFieldArgumentType.HIDDEN,
		allowedFieldTypes: [],
		values: [
			[],
			[
				{
					name: 'value',
					allowed: ['true', 'false'],
					description: '',
				},
			],
		],
		allowMultiple: false,
	},
	[ViewFieldArgumentType.CLASS]: {
		type: ViewFieldArgumentType.CLASS,
		allowedFieldTypes: [],
		values: [
			[
				{
					name: 'className',
					allowed: [],
					description: 'the name of the css class to add',
				},
			],
		],
		allowMultiple: true,
	},
	[ViewFieldArgumentType.INVALID]: {
		type: ViewFieldArgumentType.INVALID,
		allowedFieldTypes: [],
		values: [[]],
		allowMultiple: true,
	},
};

export enum RenderChildType {
	INLINE = 'inline',
	BLOCK = 'block',
}

export const EMBED_MAX_DEPTH = 8;

export enum FieldType {
	INPUT = 'INPUT',
	VIEW = 'VIEW',
	JS_VIEW = 'JS_VIEW',
	TABLE = 'TABLE',
	BUTTON_GROUP = 'BUTTON_GROUP',
	BUTTON = 'BUTTON',
	EMBED = 'EMBED',
	EXCLUDED = 'EXCLUDED',
}

export interface InputFieldOptions {
	renderChildType: RenderChildType;
	declaration: SimpleInputFieldDeclaration | string;
	scope?: BindTargetScope | undefined;
}

export interface ViewFieldOptions {
	renderChildType: RenderChildType;
	declaration: SimpleViewFieldDeclaration | string;
	scope?: BindTargetScope | undefined;
}

export interface JsViewFieldOptions {
	declaration: SimpleJsViewFieldDeclaration | string;
}

export interface TableFieldOptions {
	bindTarget: BindTargetDeclaration;
	tableHead: string[];
	columns: MetaBindColumnDeclaration[];
}

export interface ButtonGroupOptions {
	renderChildType: RenderChildType;
	declaration: SimpleButtonGroupDeclaration | string;
	position?: NotePosition | undefined;
}

export interface ButtonOptions {
	declaration: ButtonConfig | string;
	position?: NotePosition | undefined;
	isPreview: boolean;
}

export class NotePosition {
	linePosition: LinePosition | undefined;

	constructor(linePosition: LinePosition | undefined) {
		this.linePosition = linePosition;
	}

	getPosition(): LinePosition | undefined {
		return this.linePosition;
	}
}

export interface LinePosition {
	lineStart: number;
	lineEnd: number;
}

export interface EmbedOptions {
	depth: number;
	content: string;
}

export interface FieldOptionMap {
	[FieldType.INPUT]: InputFieldOptions;
	[FieldType.VIEW]: ViewFieldOptions;
	[FieldType.JS_VIEW]: JsViewFieldOptions;
	[FieldType.TABLE]: TableFieldOptions;
	[FieldType.BUTTON_GROUP]: ButtonGroupOptions;
	[FieldType.BUTTON]: ButtonOptions;
	[FieldType.EMBED]: EmbedOptions;
	[FieldType.EXCLUDED]: undefined;
}

export type InlineFieldType = FieldType.INPUT | FieldType.VIEW | FieldType.BUTTON_GROUP;

export function isFieldTypeAllowedInline(type: FieldType): type is InlineFieldType {
	return type === FieldType.INPUT || type === FieldType.VIEW || type === FieldType.BUTTON_GROUP;
}

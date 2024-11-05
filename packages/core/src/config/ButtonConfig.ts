import type { LinePosition } from 'packages/core/src/config/APIConfigs';

export enum ButtonStyleType {
	DEFAULT = 'default',
	PRIMARY = 'primary',
	DESTRUCTIVE = 'destructive',
	PLAIN = 'plain',
}

export enum ButtonActionType {
	COMMAND = 'command',
	JS = 'js',
	OPEN = 'open',
	INPUT = 'input',
	SLEEP = 'sleep',
	TEMPLATER_CREATE_NOTE = 'templaterCreateNote',
	UPDATE_METADATA = 'updateMetadata',
	CREATE_NOTE = 'createNote',
	REPLACE_IN_NOTE = 'replaceInNote',
	REGEXP_REPLACE_IN_NOTE = 'regexpReplaceInNote',
	REPLACE_SELF = 'replaceSelf',
	INSERT_INTO_NOTE = 'insertIntoNote',
	INLINE_JS = 'inlineJS',
}

export interface CommandButtonAction {
	type: ButtonActionType.COMMAND;
	command: string;
}

export interface JSButtonAction {
	type: ButtonActionType.JS;
	file: string;
	args?: Record<string, unknown>;
}

export interface OpenButtonAction {
	type: ButtonActionType.OPEN;
	link: string;
	newTab?: boolean;
}

export interface InputButtonAction {
	type: ButtonActionType.INPUT;
	str: string;
}

export interface SleepButtonAction {
	type: ButtonActionType.SLEEP;
	ms: number;
}

export interface TemplaterCreateNoteButtonAction {
	type: ButtonActionType.TEMPLATER_CREATE_NOTE;
	templateFile: string;
	folderPath?: string;
	fileName?: string;
	openNote?: boolean;
	openIfAlreadyExists?: boolean;
}

export interface UpdateMetadataButtonAction {
	type: ButtonActionType.UPDATE_METADATA;
	bindTarget: string;
	evaluate: boolean;
	value: string;
}

export interface CreateNoteButtonAction {
	type: ButtonActionType.CREATE_NOTE;
	folderPath?: string;
	fileName: string;
	openNote?: boolean;
	openIfAlreadyExists?: boolean;
}

export interface ReplaceInNoteButtonAction {
	type: ButtonActionType.REPLACE_IN_NOTE;
	fromLine: number;
	toLine: number;
	replacement: string;
	templater?: boolean;
}

export interface ReplaceSelfButtonAction {
	type: ButtonActionType.REPLACE_SELF;
	replacement: string;
	templater?: boolean;
}

export interface RegexpReplaceInNoteButtonAction {
	type: ButtonActionType.REGEXP_REPLACE_IN_NOTE;
	regexp: string;
	regexpFlags?: string;
	replacement: string;
}

export interface InsertIntoNoteButtonAction {
	type: ButtonActionType.INSERT_INTO_NOTE;
	line: number;
	value: string;
	templater?: boolean;
}

export interface InlineJSButtonAction {
	type: ButtonActionType.INLINE_JS;
	code: string;
}

export type ButtonAction =
	| CommandButtonAction
	| JSButtonAction
	| OpenButtonAction
	| InputButtonAction
	| SleepButtonAction
	| TemplaterCreateNoteButtonAction
	| UpdateMetadataButtonAction
	| CreateNoteButtonAction
	| ReplaceInNoteButtonAction
	| ReplaceSelfButtonAction
	| RegexpReplaceInNoteButtonAction
	| InsertIntoNoteButtonAction
	| InlineJSButtonAction;

export interface ButtonConfig {
	label: string;
	icon?: string;
	style: ButtonStyleType;
	class?: string;
	tooltip?: string;
	id?: string;
	hidden?: boolean;
	action?: ButtonAction;
	actions?: ButtonAction[];
}

export interface ButtonContext {
	position: LinePosition | undefined;
	isInGroup: boolean;
	isInline: boolean;
}

export interface ButtonClickContext {
	type: ButtonClickType;
	shiftKey: boolean;
	ctrlKey: boolean;
	altKey: boolean;
}

export enum ButtonClickType {
	LEFT = 'left',
	MIDDLE = 'middle',
}

export interface ButtonActionMap {
	[ButtonActionType.COMMAND]: CommandButtonAction;
	[ButtonActionType.JS]: JSButtonAction;
	[ButtonActionType.OPEN]: OpenButtonAction;
	[ButtonActionType.INPUT]: InputButtonAction;
	[ButtonActionType.SLEEP]: SleepButtonAction;
	[ButtonActionType.TEMPLATER_CREATE_NOTE]: TemplaterCreateNoteButtonAction;
	[ButtonActionType.UPDATE_METADATA]: UpdateMetadataButtonAction;
	[ButtonActionType.CREATE_NOTE]: CreateNoteButtonAction;
	[ButtonActionType.REPLACE_IN_NOTE]: ReplaceInNoteButtonAction;
	[ButtonActionType.REPLACE_SELF]: ReplaceSelfButtonAction;
	[ButtonActionType.REGEXP_REPLACE_IN_NOTE]: RegexpReplaceInNoteButtonAction;
	[ButtonActionType.INSERT_INTO_NOTE]: InsertIntoNoteButtonAction;
	[ButtonActionType.INLINE_JS]: InlineJSButtonAction;
}

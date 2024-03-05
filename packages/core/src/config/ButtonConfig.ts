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
}

export interface CommandButtonAction {
	type: ButtonActionType.COMMAND;
	command: string;
}

export interface JSButtonAction {
	type: ButtonActionType.JS;
	file: string;
	params?: string;
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
}

export interface UpdateMetadataButtonAction {
	type: ButtonActionType.UPDATE_METADATA;
	bindTarget: string;
	evaluate: boolean;
	value: string;
}

export type ButtonAction =
	| CommandButtonAction
	| JSButtonAction
	| OpenButtonAction
	| InputButtonAction
	| SleepButtonAction
	| TemplaterCreateNoteButtonAction
	| UpdateMetadataButtonAction;

export interface ButtonConfig {
	label: string;
	style: ButtonStyleType;
	class?: string;
	tooltip?: string;
	id?: string;
	hidden?: boolean;
	action?: ButtonAction;
	actions?: ButtonAction[];
}

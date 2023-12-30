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
}

export interface CommandButtonAction {
	type: ButtonActionType.COMMAND;
	command: string;
}

export interface JSButtonAction {
	type: ButtonActionType.JS;
	file: string;
}

export interface OpenButtonAction {
	type: ButtonActionType.OPEN;
	link: string;
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

export type ButtonAction =
	| CommandButtonAction
	| JSButtonAction
	| OpenButtonAction
	| InputButtonAction
	| SleepButtonAction
	| TemplaterCreateNoteButtonAction;

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

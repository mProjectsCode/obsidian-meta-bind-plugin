import type { LinePosition } from 'packages/core/src/config/APIConfigs';

export enum ButtonStyleType {
	/**
	 * Default grey button
	 */
	DEFAULT = 'default',
	/**
	 * Primary button in the accent color
	 */
	PRIMARY = 'primary',
	/**
	 * Red button for destructive actions
	 */
	DESTRUCTIVE = 'destructive',
	/**
	 * Plain button with no background
	 */
	PLAIN = 'plain',
}

export enum ButtonActionType {
	COMMAND = 'command',
	JS = 'js',
	OPEN = 'open',
	INPUT = 'input',
	SLEEP = 'sleep',
	TEMPLATER_CREATE_NOTE = 'templaterCreateNote',
	RUN_TEMPLATER_FILE = 'runTemplaterFile',
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

export interface RunTemplaterFileButtonAction {
	type: ButtonActionType.RUN_TEMPLATER_FILE;
	templateFile: string;
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
	fromLine: number | string;
	toLine: number | string;
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
	line: number | string;
	value: string;
	templater?: boolean;
}

export interface InlineJSButtonAction {
	type: ButtonActionType.INLINE_JS;
	code: string;
	args?: Record<string, unknown>;
}

/**
 * Maps action types to their respective action interfaces.
 */
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
	[ButtonActionType.RUN_TEMPLATER_FILE]: RunTemplaterFileButtonAction;
}

export type ButtonAction = ButtonActionMap[ButtonActionType];

export interface ButtonConfig {
	/**
	 * The text displayed on the button
	 */
	label: string;
	/**
	 * Optional icon to display in front of the label
	 */
	icon?: string;
	/**
	 * The style of the button
	 */
	style: ButtonStyleType;
	/**
	 * Optional CSS class to add to the button
	 */
	class?: string;
	/**
	 * Optional CSS styles to add to the button
	 */
	cssStyle?: string;
	/**
	 * Optional background image to add to the button,
	 * needed since you can't load images from the vault via pure CSS
	 */
	backgroundImage?: string;
	/**
	 * Optional tooltip to display when hovering over the button
	 */
	tooltip?: string;
	/**
	 * Optional ID for use in inline buttons
	 */
	id?: string;
	/**
	 * Whether the button is hidden
	 */
	hidden?: boolean;
	/**
	 * A single action to run when the button is clicked
	 * Mutually exclusive with `actions`
	 */
	action?: ButtonAction;
	/**
	 * Multiple actions to run when the button is clicked
	 * Mutually exclusive with `action`
	 */
	actions?: ButtonAction[];
}

export interface ButtonContext {
	position: LinePosition | undefined;
	isInGroup: boolean;
	isInline: boolean;
    parentId?: String | undefined;
}

/**
 * Provides information about the button click event.
 */
export class ButtonClickContext {
	type: ButtonClickType;
	shiftKey: boolean;
	ctrlKey: boolean;
	altKey: boolean;

	constructor(type: ButtonClickType, shiftKey: boolean, ctrlKey: boolean, altKey: boolean) {
		this.type = type;
		this.shiftKey = shiftKey;
		this.ctrlKey = ctrlKey;
		this.altKey = altKey;
	}

	static fromMouseEvent(event: MouseEvent, type: ButtonClickType): ButtonClickContext {
		return new ButtonClickContext(type, event.shiftKey, event.ctrlKey, event.altKey);
	}

	/**
	 * Whether the click should cause a link to open in a new tab.
	 * Only applicable when the click is on a link.
	 *
	 * @returns
	 */
	openInNewTab(): boolean {
		return this.type === ButtonClickType.MIDDLE || this.ctrlKey;
	}
}

export enum ButtonClickType {
	/**
	 * The user used the left mouse button to click the button
	 */
	LEFT = 'left',
	/**
	 * The user used the middle mouse button (also known as scroll wheel click) to click the button
	 */
	MIDDLE = 'middle',
}

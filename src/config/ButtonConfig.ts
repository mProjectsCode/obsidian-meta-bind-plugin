import { z } from 'zod';
import { oneOf, schemaForType } from '../utils/ZodUtils';

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

export const CommandButtonActionValidator = schemaForType<CommandButtonAction>()(
	z.object({
		type: z.literal(ButtonActionType.COMMAND),
		command: z.string(),
	}),
);

export interface JSButtonAction {
	type: ButtonActionType.JS;
	file: string;
}

export const JSButtonActionValidator = schemaForType<JSButtonAction>()(
	z.object({
		type: z.literal(ButtonActionType.JS),
		file: z.string(),
	}),
);

export interface OpenButtonAction {
	type: ButtonActionType.OPEN;
	link: string;
}

export const OpenButtonActionValidator = schemaForType<OpenButtonAction>()(
	z.object({
		type: z.literal(ButtonActionType.OPEN),
		link: z.string(),
	}),
);

export interface InputButtonAction {
	type: ButtonActionType.INPUT;
	str: string;
}

export const InputButtonActionValidator = schemaForType<InputButtonAction>()(
	z.object({
		type: z.literal(ButtonActionType.INPUT),
		str: z.string(),
	}),
);

export interface SleepButtonAction {
	type: ButtonActionType.SLEEP;
	ms: number;
}

export const SleepButtonActionValidator = schemaForType<SleepButtonAction>()(
	z.object({
		type: z.literal(ButtonActionType.SLEEP),
		ms: z.number(),
	}),
);

export interface TemplaterCreateNoteButtonAction {
	type: ButtonActionType.TEMPLATER_CREATE_NOTE;
	templateFile: string;
	folderPath?: string;
	fileName?: string;
	openNote?: boolean;
}

export const TemplaterCreateNoteButtonActionValidator = schemaForType<TemplaterCreateNoteButtonAction>()(
	z.object({
		type: z.literal(ButtonActionType.TEMPLATER_CREATE_NOTE),
		templateFile: z.string(),
		folderPath: z.string().optional(),
		fileName: z.string().optional(),
		openNote: z.boolean().optional(),
	}),
);

export type ButtonAction =
	| CommandButtonAction
	| JSButtonAction
	| OpenButtonAction
	| InputButtonAction
	| SleepButtonAction
	| TemplaterCreateNoteButtonAction;

export const ButtonActionValidator = schemaForType<ButtonAction>()(
	z.union([
		CommandButtonActionValidator,
		JSButtonActionValidator,
		OpenButtonActionValidator,
		InputButtonActionValidator,
		SleepButtonActionValidator,
		TemplaterCreateNoteButtonActionValidator,
	]),
);

export interface ButtonConfig {
	label: string;
	style: ButtonStyleType;
	id?: string;
	hidden?: boolean;
	action?: ButtonAction;
	actions?: ButtonAction[];
}

type Tuple<T> = [T, ...T[]];
export const ButtonStyleValidator = z.enum(Object.values(ButtonStyleType) as Tuple<ButtonStyleType>);

export const ButtonConfigValidator = schemaForType<ButtonConfig>()(
	z
		.object({
			label: z.string(),
			style: ButtonStyleValidator,
			id: z.string().optional(),
			hidden: z.boolean().optional(),
			action: ButtonActionValidator.optional(),
			actions: ButtonActionValidator.array().optional(),
		})
		.superRefine(oneOf('action', 'actions')),
);

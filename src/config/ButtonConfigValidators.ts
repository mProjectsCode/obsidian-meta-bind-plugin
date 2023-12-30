import { oneOf, schemaForType } from '../utils/ZodUtils';
import { z } from 'zod';
import {
	type ButtonAction,
	ButtonActionType,
	type ButtonConfig,
	ButtonStyleType,
	type CommandButtonAction,
	type InputButtonAction,
	type JSButtonAction,
	type OpenButtonAction,
	type SleepButtonAction,
	type TemplaterCreateNoteButtonAction,
} from './ButtonConfig';

export const ButtonConfigValidators = schemaForType<CommandButtonAction>()(
	z.object({
		type: z.literal(ButtonActionType.COMMAND),
		command: z.string(),
	}),
);
export const JSButtonActionValidator = schemaForType<JSButtonAction>()(
	z.object({
		type: z.literal(ButtonActionType.JS),
		file: z.string(),
	}),
);
export const OpenButtonActionValidator = schemaForType<OpenButtonAction>()(
	z.object({
		type: z.literal(ButtonActionType.OPEN),
		link: z.string(),
	}),
);
export const InputButtonActionValidator = schemaForType<InputButtonAction>()(
	z.object({
		type: z.literal(ButtonActionType.INPUT),
		str: z.string(),
	}),
);
export const SleepButtonActionValidator = schemaForType<SleepButtonAction>()(
	z.object({
		type: z.literal(ButtonActionType.SLEEP),
		ms: z.number(),
	}),
);
export const TemplaterCreateNoteButtonActionValidator = schemaForType<TemplaterCreateNoteButtonAction>()(
	z.object({
		type: z.literal(ButtonActionType.TEMPLATER_CREATE_NOTE),
		templateFile: z.string(),
		folderPath: z.string().optional(),
		fileName: z.string().optional(),
		openNote: z.boolean().optional(),
	}),
);
export const ButtonActionValidator = schemaForType<ButtonAction>()(
	z.union([
		ButtonConfigValidators,
		JSButtonActionValidator,
		OpenButtonActionValidator,
		InputButtonActionValidator,
		SleepButtonActionValidator,
		TemplaterCreateNoteButtonActionValidator,
	]),
);
export const ButtonStyleValidator = z.nativeEnum(ButtonStyleType);
export const ButtonConfigValidator = schemaForType<ButtonConfig>()(
	z
		.object({
			label: z.string(),
			style: ButtonStyleValidator,
			class: z.string().optional(),
			tooltip: z.string().optional(),
			id: z.string().optional(),
			hidden: z.boolean().optional(),
			action: ButtonActionValidator.optional(),
			actions: ButtonActionValidator.array().optional(),
		})
		.superRefine(oneOf('action', 'actions')),
);

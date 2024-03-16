import {
	type ButtonAction,
	ButtonActionType,
	type ButtonConfig,
	ButtonStyleType,
	type CommandButtonAction,
	type CreateNoteButtonAction,
	type InputButtonAction,
	type JSButtonAction,
	type ReplaceInNoteButtonAction,
	type OpenButtonAction,
	type SleepButtonAction,
	type TemplaterCreateNoteButtonAction,
	type UpdateMetadataButtonAction,
	type ReplaceSelfButtonAction,
	type RegexpReplaceInNoteButtonAction,
	type InsertIntoNoteButtonAction,
} from 'packages/core/src/config/ButtonConfig';
import { oneOf, schemaForType } from 'packages/core/src/utils/ZodUtils';
import { z } from 'zod';

export const V_CommandButtonAction = schemaForType<CommandButtonAction>()(
	z.object({
		type: z.literal(ButtonActionType.COMMAND),
		command: z.string(),
	}),
);

export const V_JSButtonAction = schemaForType<JSButtonAction>()(
	z.object({
		type: z.literal(ButtonActionType.JS),
		file: z.string(),
		args: z.record(z.unknown()).optional(),
	}),
);

export const V_OpenButtonAction = schemaForType<OpenButtonAction>()(
	z.object({
		type: z.literal(ButtonActionType.OPEN),
		link: z.string(),
		newTab: z.boolean().optional(),
	}),
);

export const V_InputButtonAction = schemaForType<InputButtonAction>()(
	z.object({
		type: z.literal(ButtonActionType.INPUT),
		str: z.string(),
	}),
);

export const V_SleepButtonAction = schemaForType<SleepButtonAction>()(
	z.object({
		type: z.literal(ButtonActionType.SLEEP),
		ms: z.number(),
	}),
);

export const V_TemplaterCreateNoteButtonAction = schemaForType<TemplaterCreateNoteButtonAction>()(
	z.object({
		type: z.literal(ButtonActionType.TEMPLATER_CREATE_NOTE),
		templateFile: z.string(),
		folderPath: z.string().optional(),
		fileName: z.string().optional(),
		openNote: z.boolean().optional(),
	}),
);
export const V_UpdateMetadataButtonAction = schemaForType<UpdateMetadataButtonAction>()(
	z.object({
		type: z.literal(ButtonActionType.UPDATE_METADATA),
		bindTarget: z.string(),
		evaluate: z.boolean(),
		value: z.coerce.string(),
	}),
);

export const V_CreateNoteButtonAction = schemaForType<CreateNoteButtonAction>()(
	z.object({
		type: z.literal(ButtonActionType.CREATE_NOTE),
		folderPath: z.string().optional(),
		fileName: z.string(),
		openNote: z.boolean().optional(),
	}),
);

export const V_ReplaceInNoteButtonAction = schemaForType<ReplaceInNoteButtonAction>()(
	z.object({
		type: z.literal(ButtonActionType.REPLACE_IN_NOTE),
		fromLine: z.number(),
		toLine: z.number(),
		replacement: z.string(),
		templater: z.boolean().optional(),
	}),
);

export const V_ReplaceSelfButtonAction = schemaForType<ReplaceSelfButtonAction>()(
	z.object({
		type: z.literal(ButtonActionType.REPLACE_SELF),
		replacement: z.string(),
		templater: z.boolean().optional(),
	}),
);

export const V_RegexpReplaceInNoteButtonAction = schemaForType<RegexpReplaceInNoteButtonAction>()(
	z.object({
		type: z.literal(ButtonActionType.REGEXP_REPLACE_IN_NOTE),
		regexp: z.string(),
		replacement: z.string(),
	}),
);

export const V_InsertIntoNoteButtonAction = schemaForType<InsertIntoNoteButtonAction>()(
	z.object({
		type: z.literal(ButtonActionType.INSERT_INTO_NOTE),
		line: z.number(),
		value: z.string(),
		templater: z.boolean().optional(),
	}),
);

export const V_ButtonAction = schemaForType<ButtonAction>()(
	z.union([
		V_CommandButtonAction,
		V_JSButtonAction,
		V_OpenButtonAction,
		V_InputButtonAction,
		V_SleepButtonAction,
		V_TemplaterCreateNoteButtonAction,
		V_UpdateMetadataButtonAction,
		V_CreateNoteButtonAction,
		V_ReplaceInNoteButtonAction,
		V_ReplaceSelfButtonAction,
		V_RegexpReplaceInNoteButtonAction,
		V_InsertIntoNoteButtonAction,
	]),
);

export const V_ButtonStyleType = z.nativeEnum(ButtonStyleType);

export const V_ButtonConfig = schemaForType<ButtonConfig>()(
	z
		.object({
			label: z.string(),
			style: V_ButtonStyleType,
			class: z.string().optional(),
			tooltip: z.string().optional(),
			id: z.string().optional(),
			hidden: z.boolean().optional(),
			action: V_ButtonAction.optional(),
			actions: V_ButtonAction.array().optional(),
		})
		.superRefine(oneOf('action', 'actions')),
);

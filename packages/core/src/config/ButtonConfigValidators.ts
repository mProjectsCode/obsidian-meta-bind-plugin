import {
	type ButtonAction,
	ButtonActionType,
	type ButtonConfig,
	ButtonStyleType,
	type CommandButtonAction,
	type CreateNoteButtonAction,
	type InlineJsButtonAction,
	type InputButtonAction,
	type InsertIntoNoteButtonAction,
	type JSButtonAction,
	type OpenButtonAction,
	type RegexpReplaceInNoteButtonAction,
	type ReplaceInNoteButtonAction,
	type ReplaceSelfButtonAction,
	type SleepButtonAction,
	type TemplaterCreateNoteButtonAction,
	type UpdateMetadataButtonAction,
} from 'packages/core/src/config/ButtonConfig';
import { oneOf, schemaForType } from 'packages/core/src/utils/ZodUtils';
import { z } from 'zod';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function numberValidator(action: string, name: string, description: string) {
	return z.number({
		required_error: `The ${action} action requires a specified ${description} with the '${name}' field.`,
		invalid_type_error: `The ${action} action requires the value of the '${name}' fields to be a number.`,
	});
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function stringValidator(action: string, name: string, description: string) {
	return z.string({
		required_error: `The ${action} action requires a specified ${description} with the '${name}' field.`,
		invalid_type_error: `The ${action} action requires the value of the '${name}' fields to be a string.`,
	});
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function booleanValidator(action: string, name: string, description: string) {
	return z.boolean({
		required_error: `The ${action} action requires a specified ${description} with the '${name}' field.`,
		invalid_type_error: `The ${action} action requires the value of the '${name}' fields to be a boolean.`,
	});
}

export const V_CommandButtonAction = schemaForType<CommandButtonAction>()(
	z.object({
		type: z.literal(ButtonActionType.COMMAND),
		command: stringValidator('command', 'command', 'command to run'),
	}),
);

export const V_JSButtonAction = schemaForType<JSButtonAction>()(
	z.object({
		type: z.literal(ButtonActionType.JS),
		file: stringValidator('js', 'file', 'file path to the file to run'),
		args: z.record(z.unknown()).optional(),
	}),
);

export const V_OpenButtonAction = schemaForType<OpenButtonAction>()(
	z.object({
		type: z.literal(ButtonActionType.OPEN),
		link: stringValidator('open', 'link', 'link to open'),
		newTab: booleanValidator('open', 'newTab', '').optional(),
	}),
);

export const V_InputButtonAction = schemaForType<InputButtonAction>()(
	z.object({
		type: z.literal(ButtonActionType.INPUT),
		str: stringValidator('input', 'str', 'value to input'),
	}),
);

export const V_SleepButtonAction = schemaForType<SleepButtonAction>()(
	z.object({
		type: z.literal(ButtonActionType.SLEEP),
		ms: numberValidator('sleep', 'ms', 'duration'),
	}),
);

// TODO: more better error messages
export const V_TemplaterCreateNoteButtonAction = schemaForType<TemplaterCreateNoteButtonAction>()(
	z.object({
		type: z.literal(ButtonActionType.TEMPLATER_CREATE_NOTE),
		templateFile: stringValidator('templaterCreateNote', 'templateFile', 'template file path'),
		folderPath: stringValidator('templaterCreateNote', 'folderPath', 'folder path').optional(),
		fileName: stringValidator('templaterCreateNote', 'fileName', 'file name').optional(),
		openNote: booleanValidator('templaterCreateNote', 'openNote', 'value for whether to open the note').optional(),
	}),
);
export const V_UpdateMetadataButtonAction = schemaForType<UpdateMetadataButtonAction>()(
	z.object({
		type: z.literal(ButtonActionType.UPDATE_METADATA),
		bindTarget: stringValidator('updateMetadata', 'bindTarget', 'bind target to the metadata to update'),
		evaluate: booleanValidator(
			'updateMetadata',
			'evaluate',
			'value for whether to evaluate the value as a JavaScript expression',
		),
		value: z.coerce.string({
			required_error: `The updateMetadata action requires a specified value for the update with the 'value' field.`,
			invalid_type_error: `The updateMetadata action requires the value of the 'value' fields to be a string.`,
		}),
	}),
);

export const V_CreateNoteButtonAction = schemaForType<CreateNoteButtonAction>()(
	z.object({
		type: z.literal(ButtonActionType.CREATE_NOTE),
		folderPath: stringValidator('createNote', 'folderPath', 'folder path').optional(),
		fileName: stringValidator('createNote', 'fileName', 'file name'),
		openNote: booleanValidator('createNote', 'openNote', 'value for whether to open the note').optional(),
	}),
);

export const V_ReplaceInNoteButtonAction = schemaForType<ReplaceInNoteButtonAction>()(
	z.object({
		type: z.literal(ButtonActionType.REPLACE_IN_NOTE),
		fromLine: numberValidator('replaceInNote', 'fromLine', 'line to replace from'),
		toLine: numberValidator('replaceInNote', 'toLine', 'line to replace to'),
		replacement: stringValidator('replaceInNote', 'replacement', 'replacement string'),
		templater: booleanValidator('replaceInNote', 'templater', 'value for whether to use Templater').optional(),
	}),
);

export const V_ReplaceSelfButtonAction = schemaForType<ReplaceSelfButtonAction>()(
	z.object({
		type: z.literal(ButtonActionType.REPLACE_SELF),
		replacement: stringValidator('replaceSelf', 'replacement', 'replacement string'),
		templater: booleanValidator('replaceSelf', 'templater', 'value for whether to use Templater').optional(),
	}),
);

export const V_RegexpReplaceInNoteButtonAction = schemaForType<RegexpReplaceInNoteButtonAction>()(
	z.object({
		type: z.literal(ButtonActionType.REGEXP_REPLACE_IN_NOTE),
		regexp: stringValidator('regexpReplaceInNote', 'regexp', 'search regular expression'),
		replacement: stringValidator('regexpReplaceInNote', 'replacement', 'replacement string'),
	}),
);

export const V_InsertIntoNoteButtonAction = schemaForType<InsertIntoNoteButtonAction>()(
	z.object({
		type: z.literal(ButtonActionType.INSERT_INTO_NOTE),
		relative: booleanValidator(
			'insertIntoNote',
			'relative',
			'value for whether the line number is relative to the button',
		),
		line: numberValidator('insertIntoNote', 'line', 'line to insert at'),
		value: stringValidator('insertIntoNote', 'value', 'string to insert'),
		templater: booleanValidator('insertIntoNote', 'templater', 'value for whether to use Templater').optional(),
	}),
);

export const V_InlineJsButtonAction = schemaForType<InlineJsButtonAction>()(
	z.object({
		type: z.literal(ButtonActionType.INLINE_JS),
		code: stringValidator('inlineJS', 'code', 'code string to run'),
	}),
);

export const V_ButtonAction = schemaForType<ButtonAction>()(
	z.discriminatedUnion('type', [
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
		V_InlineJsButtonAction,
	]),
);

export const V_ButtonStyleType = z.nativeEnum(ButtonStyleType);

export const V_ButtonConfig = schemaForType<ButtonConfig>()(
	z
		.object({
			label: z.string(),
			icon: z.string().optional(),
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

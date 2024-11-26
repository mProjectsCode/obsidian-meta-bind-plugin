import type {
	ButtonAction,
	ButtonConfig,
	CommandButtonAction,
	CreateNoteButtonAction,
	InlineJSButtonAction,
	InputButtonAction,
	InsertIntoNoteButtonAction,
	JSButtonAction,
	OpenButtonAction,
	RegexpReplaceInNoteButtonAction,
	ReplaceInNoteButtonAction,
	ReplaceSelfButtonAction,
	RunTemplaterFileButtonAction,
	SleepButtonAction,
	TemplaterCreateNoteButtonAction,
	UpdateMetadataButtonAction,
} from 'packages/core/src/config/ButtonConfig';
import { ButtonActionType, ButtonStyleType } from 'packages/core/src/config/ButtonConfig';
import { oneOf, schemaForType } from 'packages/core/src/utils/ZodUtils';
import { z } from 'zod';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function actionFieldNumber(action: string, name: string, description: string) {
	return z.number({
		required_error: `The ${action} action requires a specified ${description} with the '${name}' field.`,
		invalid_type_error: `The ${action} action requires the value of the '${name}' fields to be a number.`,
	});
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function actionFieldString(action: string, name: string, description: string) {
	return z.string({
		required_error: `The ${action} action requires a specified ${description} with the '${name}' field.`,
		invalid_type_error: `The ${action} action requires the value of the '${name}' fields to be a string.`,
	});
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function actionFieldBool(action: string, name: string, description: string) {
	return z.boolean({
		required_error: `The ${action} action requires a specified ${description} with the '${name}' field.`,
		invalid_type_error: `The ${action} action requires the value of the '${name}' fields to be a boolean.`,
	});
}

export const V_CommandButtonAction = schemaForType<CommandButtonAction>()(
	z.object({
		type: z.literal(ButtonActionType.COMMAND),
		command: actionFieldString('command', 'command', 'command to run'),
	}),
);

export const V_JSButtonAction = schemaForType<JSButtonAction>()(
	z.object({
		type: z.literal(ButtonActionType.JS),
		file: actionFieldString('js', 'file', 'file path to the file to run'),
		args: z.record(z.unknown()).optional(),
	}),
);

export const V_OpenButtonAction = schemaForType<OpenButtonAction>()(
	z.object({
		type: z.literal(ButtonActionType.OPEN),
		link: actionFieldString('open', 'link', 'link to open'),
		newTab: actionFieldBool('open', 'newTab', '').optional(),
	}),
);

export const V_InputButtonAction = schemaForType<InputButtonAction>()(
	z.object({
		type: z.literal(ButtonActionType.INPUT),
		str: actionFieldString('input', 'str', 'value to input'),
	}),
);

export const V_SleepButtonAction = schemaForType<SleepButtonAction>()(
	z.object({
		type: z.literal(ButtonActionType.SLEEP),
		ms: actionFieldNumber('sleep', 'ms', 'duration'),
	}),
);

// TODO: more better error messages
export const V_TemplaterCreateNoteButtonAction = schemaForType<TemplaterCreateNoteButtonAction>()(
	z.object({
		type: z.literal(ButtonActionType.TEMPLATER_CREATE_NOTE),
		templateFile: actionFieldString('templaterCreateNote', 'templateFile', 'template file path'),
		folderPath: actionFieldString('templaterCreateNote', 'folderPath', 'folder path').optional(),
		fileName: actionFieldString('templaterCreateNote', 'fileName', 'file name').optional(),
		openNote: actionFieldBool('templaterCreateNote', 'openNote', 'value for whether to open the note').optional(),
		openIfAlreadyExists: actionFieldBool(
			'templaterCreateNote',
			'openIfAlreadyExists',
			'value for whether to open the note if it already exists',
		).optional(),
	}),
);

export const V_RunTemplaterFileButtonAction = schemaForType<RunTemplaterFileButtonAction>()(
	z.object({
		type: z.literal(ButtonActionType.RUN_TEMPLATER_FILE),
		templateFile: stringValidator('runTemplaterFile', 'templateFile', 'template file path'),
	}),
);

export const V_UpdateMetadataButtonAction = schemaForType<UpdateMetadataButtonAction>()(
	z.object({
		type: z.literal(ButtonActionType.UPDATE_METADATA),
		bindTarget: actionFieldString('updateMetadata', 'bindTarget', 'bind target to the metadata to update'),
		evaluate: actionFieldBool(
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
		folderPath: actionFieldString('createNote', 'folderPath', 'folder path').optional(),
		fileName: actionFieldString('createNote', 'fileName', 'file name'),
		openNote: actionFieldBool('createNote', 'openNote', 'value for whether to open the note').optional(),
		openIfAlreadyExists: actionFieldBool(
			'createNote',
			'openIfAlreadyExists',
			'value for whether to open the note if it already exists',
		).optional(),
	}),
);

export const V_ReplaceInNoteButtonAction = schemaForType<ReplaceInNoteButtonAction>()(
	z.object({
		type: z.literal(ButtonActionType.REPLACE_IN_NOTE),
		fromLine: actionFieldNumber('replaceInNote', 'fromLine', 'line to replace from'),
		toLine: actionFieldNumber('replaceInNote', 'toLine', 'line to replace to'),
		replacement: actionFieldString('replaceInNote', 'replacement', 'replacement string'),
		templater: actionFieldBool('replaceInNote', 'templater', 'value for whether to use Templater').optional(),
	}),
);

export const V_ReplaceSelfButtonAction = schemaForType<ReplaceSelfButtonAction>()(
	z.object({
		type: z.literal(ButtonActionType.REPLACE_SELF),
		replacement: actionFieldString('replaceSelf', 'replacement', 'replacement string'),
		templater: actionFieldBool('replaceSelf', 'templater', 'value for whether to use Templater').optional(),
	}),
);

export const V_RegexpReplaceInNoteButtonAction = schemaForType<RegexpReplaceInNoteButtonAction>()(
	z.object({
		type: z.literal(ButtonActionType.REGEXP_REPLACE_IN_NOTE),
		regexp: actionFieldString('regexpReplaceInNote', 'regexp', 'search regular expression'),
		regexpFlags: actionFieldString(
			'regexpReplaceInNote',
			'regexpFlags',
			'regular expression flags string',
		).optional(),
		replacement: actionFieldString('regexpReplaceInNote', 'replacement', 'replacement string'),
	}),
);

export const V_InsertIntoNoteButtonAction = schemaForType<InsertIntoNoteButtonAction>()(
	z.object({
		type: z.literal(ButtonActionType.INSERT_INTO_NOTE),
		line: actionFieldNumber('insertIntoNote', 'line', 'line to insert at'),
		value: actionFieldString('insertIntoNote', 'value', 'string to insert'),
		templater: actionFieldBool('insertIntoNote', 'templater', 'value for whether to use Templater').optional(),
	}),
);

export const V_InlineJSButtonAction = schemaForType<InlineJSButtonAction>()(
	z.object({
		type: z.literal(ButtonActionType.INLINE_JS),
		code: actionFieldString('inlineJS', 'code', 'code string to run'),
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
		V_InlineJSButtonAction,
		V_RunTemplaterFileButtonAction,
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

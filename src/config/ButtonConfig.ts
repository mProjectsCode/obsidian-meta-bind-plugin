import { type RefinementCtx, z } from 'zod';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function schemaForType<T>(): <S extends z.ZodType<T, any, any>>(arg: S) => S {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return function <S extends z.ZodType<T, any, any>>(arg: S): S {
		return arg;
	};
}

export enum ButtonStyleType {
	DEFUALT = 'default',
	PRIMARY = 'primary',
	DESTRUCTIVE = 'destructive',
	PLAIN = 'plain',
}

export enum ButtonActionType {
	COMMAND = 'command',
	JS = 'js',
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
	jsFile: string;
}

export const JSButtonActionValidator = schemaForType<JSButtonAction>()(
	z.object({
		type: z.literal(ButtonActionType.JS),
		jsFile: z.string(),
	}),
);

export type ButtonAction = CommandButtonAction | JSButtonAction;

export const ButtonActionValidator = schemaForType<ButtonAction>()(
	z.union([CommandButtonActionValidator, JSButtonActionValidator]),
);

export interface ButtonConfig {
	label: string;
	style: ButtonStyleType;
	action?: ButtonAction;
	actions?: ButtonAction[];
}

type Tuple<T> = [T, ...T[]];
export const ButtonStyleValidator = z.enum(Object.values(ButtonStyleType) as Tuple<ButtonStyleType>);

function oneOf<
	A,
	K1 extends Extract<keyof A, string>,
	K2 extends Extract<keyof A, string>,
	R extends A &
		((Required<Pick<A, K1>> & { [P in K2]: undefined }) | (Required<Pick<A, K2>> & { [P in K1]: undefined })),
>(key1: K1, key2: K2): (arg: A, ctx: RefinementCtx) => arg is R {
	return (arg, ctx): arg is R => {
		if ((arg[key1] === undefined) === (arg[key2] === undefined)) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: `Either ${key1} or ${key2} must be filled, but not both`,
			});
			return false;
		}
		return true;
	};
}

export const ButtonConfigValidator = schemaForType<ButtonConfig>()(
	z
		.object({
			label: z.string(),
			style: ButtonStyleValidator,
			action: ButtonActionValidator.optional(),
			actions: ButtonActionValidator.array().optional(),
		})
		.superRefine(oneOf('action', 'actions')),
);

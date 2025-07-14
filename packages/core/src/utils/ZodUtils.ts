import type { Parser } from '@lemons_dev/parsinom/lib/Parser';
import { ParsingError } from 'packages/core/src/parsers/ParsingError';
import { ErrorLevel, MetaBindInternalError } from 'packages/core/src/utils/errors/MetaBindErrors';
import type { ZodError } from 'zod';
import { z } from 'zod';
import type { ParsePayload } from 'zod/v4/core/index.cjs';

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type,@typescript-eslint/explicit-function-return-type
export function zodFunction<T extends Function>() {
	return z.custom<T>(val => {
		return typeof val === 'function';
	});
}

export function oneOf<A, K1 extends Extract<keyof A, string>, K2 extends Extract<keyof A, string>>(
	key1: K1,
	key2: K2,
): (ctx: ParsePayload<A>) => void {
	return ctx => {
		if ((ctx.value[key1] === undefined) === (ctx.value[key2] === undefined)) {
			ctx.issues.push({
				code: 'custom',
				message: `Either ${key1} or ${key2} must be used, but not both.`,
				input: ctx.value,
			});
		}
	};
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function schemaForType<T>(): <S extends z.ZodType<T, any, any>>(arg: S) => S {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return function <S extends z.ZodType<T, any, any>>(arg: S): S {
		return arg;
	};
}

export function validateAPIArgs<T>(validator: z.ZodType<T>, args: T): void {
	const result = validator.safeParse(args);

	if (!result.success) {
		throw new MetaBindInternalError({
			errorLevel: ErrorLevel.CRITICAL,
			effect: 'Failed to run function due to invalid arguments. Check that the arguments that you are passing to the function match the type definition of the function.',
			cause: result.error,
		});
	}
}

export function validate<T>(validator: z.ZodType<T>, value: unknown): ReturnType<z.ZodType<T>['safeParse']> {
	return validator.safeParse(value);
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function parserToValidator<T>(str: z.ZodType<string>, parser: Parser<T>) {
	return str.transform((data, ctx) => {
		const result = parser.tryParse(data);

		if (result.success) {
			return result.value;
		} else {
			ctx.addIssue({
				code: 'custom',
				message: new ParsingError(ErrorLevel.ERROR, 'parsiNOM parser', data, result).message,
			});
			return z.NEVER;
		}
	});
}

const specialNumberNames = [
	'zeroth',
	'first',
	'second',
	'third',
	'fourth',
	'fifth',
	'sixth',
	'seventh',
	'eighth',
	'ninth',
	'tenth',
	'eleventh',
	'twelfth',
	'thirteenth',
	'fourteenth',
	'fifteenth',
	'sixteenth',
	'seventeenth',
	'eighteenth',
	'nineteenth',
];
const deciPrefix = ['twent', 'thirt', 'fort', 'fift', 'sixt', 'sevent', 'eight', 'ninet'];

// Note: this only works for numbers 0-99, but can be extended if needed
function stringifyNumber(n: number): string {
	if (n < 20) {
		return specialNumberNames[n];
	}
	if (n % 10 === 0) {
		return deciPrefix[Math.floor(n / 10) - 2] + 'ieth';
	}
	return deciPrefix[Math.floor(n / 10) - 2] + 'y-' + specialNumberNames[n % 10];
}

export function toReadableError(error: ZodError): string {
	let message = '';

	for (const issue of error.issues) {
		const readablePath = prettifyErrorPath(issue.path);
		message += `✖ ${issue.message ?? issue.code} \n  → at '${readablePath}'\n`;
	}

	return message.trim();
}

function prettifyErrorPath(path: (string | number | symbol)[] | undefined): string {
	if (!path || path.length === 0) {
		return 'unknown location';
	}

	return path
		.map(x => {
			if (typeof x === 'string') {
				return x;
			} else if (typeof x === 'symbol') {
				return x.toString();
			} else {
				return stringifyNumber(x + 1) + ' element';
			}
		})
		.join(' > ');
}

import type { Parser } from '@lemons_dev/parsinom';
import { ParsingError } from 'packages/core/src/parsers/ParsingError';
import { ErrorLevel, MetaBindInternalError } from 'packages/core/src/utils/errors/MetaBindErrors';
import type { ZodError } from 'zod';
import { z } from 'zod';

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type,@typescript-eslint/explicit-function-return-type
export function zodFunction<T extends Function>() {
	return z.custom<T>(val => {
		return typeof val === 'function';
	});
}

export function oneOf<K1 extends string, K2 extends string>(key1: K1, key2: K2) {
	// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
	return function <Shape extends Record<K1 | K2, z.ZodTypeAny>>(schema: z.ZodObject<Shape>) {
		return schema.refine(
			data => {
				const value = data as Record<K1 | K2, unknown>;
				return (value[key1] === undefined) !== (value[key2] === undefined);
			},
			{
				message: `Either ${key1} or ${key2} must be used, but not both.`,
				path: [key2],
			},
		);
	};
}

export function schemaForType<T>(): <S extends z.ZodType<T>>(arg: S) => S {
	return function <S extends z.ZodType<T>>(arg: S): S {
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

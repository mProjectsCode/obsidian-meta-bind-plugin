import { ErrorLevel, MetaBindInternalError } from 'packages/core/src/utils/errors/MetaBindErrors';
import type { RefinementCtx } from 'zod';
import { z } from 'zod';

export function oneOf<
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
				message: `Either ${key1} or ${key2} must be used, but not both.`,
			});
			return false;
		}
		return true;
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
	return validator.safeParse(value, { errorMap: customErrorMap });
}

const special = [
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
const deca = ['twent', 'thirt', 'fort', 'fift', 'sixt', 'sevent', 'eight', 'ninet'];

function stringifyNumber(n: number): string {
	if (n < 20) {
		return special[n];
	}
	if (n % 10 === 0) {
		return deca[Math.floor(n / 10) - 2] + 'ieth';
	}
	return deca[Math.floor(n / 10) - 2] + 'y-' + special[n % 10];
}

export const customErrorMap: z.ZodErrorMap = (issue, ctx) => {
	const readablePath = issue.path
		.map(x => {
			if (typeof x === 'string') {
				return x;
			} else {
				return stringifyNumber(x + 1) + ' element';
			}
		})
		.join(' > ');

	// if (issue.code === z.ZodIssueCode.invalid_type) {
	// 	if (issue.received === 'undefined') {
	// 		return {
	// 			message: `Value at '${readablePath}' is required.`,
	// 		};
	// 	}
	// }

	return {
		message: `At '${readablePath}'. ${ctx.defaultError}`,
	};
};

import { type Tuple } from 'packages/core/src/utils/Utils';
import { ErrorLevel, MetaBindInternalError } from 'packages/core/src/utils/errors/MetaBindErrors';
import { type RefinementCtx, z } from 'zod';
import { fromZodError } from 'zod-validation-error';

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
				message: `Either ${key1} or ${key2} must be filled, but not both`,
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

export type ZodifyTuple<T extends Tuple<unknown>> = { [P in keyof T]: z.ZodType<T[P]> };

export function validateArgs<T extends Tuple<unknown>>(validator: z.ZodTuple<ZodifyTuple<T>>, args: T): void {
	const result = validator.safeParse(args);

	if (!result.success) {
		throw new MetaBindInternalError({
			errorLevel: ErrorLevel.CRITICAL,
			effect: 'invalid arguments supplied to function',
			cause: fromZodError(result.error),
		});
	}
}

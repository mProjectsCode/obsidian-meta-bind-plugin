import { type Parser } from '@lemons_dev/parsinom/lib/Parser';
import { P } from '@lemons_dev/parsinom/lib/ParsiNOM';
import { P_UTILS } from '@lemons_dev/parsinom/lib/ParserUtils';

export type MBLiteral = string | number | boolean | null;
export type MBExtendedLiteral = MBLiteral | MBLiteral[];

const floatParser: Parser<number> = P.sequenceMap(
	(sign, number) => (sign === undefined ? number : -number),
	P.string('-').optional(),
	P.or(
		P.sequenceMap((a, b, c) => Number(a + b + c), P_UTILS.digits(), P.string('.'), P_UTILS.digits()),
		P_UTILS.digits().map(x => Number(x)),
	),
).thenEof();

const intParser: Parser<number> = P.sequenceMap(
	(sign, number) => (sign === undefined ? number : -number),
	P.string('-').optional(),
	P_UTILS.digits().map(x => Number(x)),
).thenEof();

export function parseLiteral(literalString: string): MBLiteral {
	if (literalString.toLowerCase() === 'null') {
		return null;
	} else if (literalString === 'true') {
		return true;
	} else if (literalString === 'false') {
		return false;
	} else {
		const parseResult = floatParser.tryParse(literalString);

		if (parseResult.success) {
			return parseResult.value;
		} else {
			return literalString;
		}
	}
}

export function stringifyLiteral(literal: MBExtendedLiteral | undefined): string {
	if (literal === undefined) {
		return '';
	}

	if (literal === null) {
		return 'null';
	}

	if (typeof literal === 'string') {
		return literal;
	} else if (typeof literal === 'boolean') {
		return literal ? 'true' : 'false';
	} else {
		// typeof number
		return literal.toString();
	}
}

export function isLiteral(literal: unknown): literal is MBLiteral {
	return literal === null || typeof literal === 'string' || typeof literal === 'boolean' || typeof literal === 'number';
}

/**
 * Turns a value into an array of literals. If it can't convert, it returns undefined.
 *
 * @param literal
 */
export function parseUnknownToLiteralArray(literal: unknown): MBLiteral[] | undefined {
	if (literal === undefined || literal === null) {
		return undefined;
	}

	if (isLiteral(literal)) {
		return [literal];
	}

	if (typeof literal === 'object' && Array.isArray(literal)) {
		return literal.filter(x => isLiteral(x)) as MBLiteral[];
	}

	return undefined;
}

/**
 * Turns a value into a float. If it can't convert, it returns undefined.
 *
 * @param literal
 */
export function parseUnknownToFloat(literal: unknown): number | undefined {
	if (typeof literal === 'number') {
		return literal;
	} else if (typeof literal === 'string') {
		const v = floatParser.tryParse(literal);
		if (v.success) {
			return v.value;
		}
	}

	return undefined;
}

/**
 * Turns a value into an int. If it can't convert, it returns undefined.
 *
 * @param literal
 */
export function parseUnknownToInt(literal: unknown): number | undefined {
	if (typeof literal === 'number') {
		return literal;
	} else if (typeof literal === 'string') {
		const v = intParser.tryParse(literal);
		if (v.success) {
			return v.value;
		}
	}

	return undefined;
}

/**
 * Turns a value into a string. If it can't convert, it returns undefined.
 *
 * @param literal
 */
export function parseUnknownToString(literal: unknown): string | undefined {
	return isLiteral(literal) ? literal?.toString() : undefined;
}

/**
 * Turns a value into a literal. If it can't convert, it returns undefined.
 *
 * @param literal
 */
export function parseUnknownToLiteral(literal: unknown): MBLiteral | undefined {
	return isLiteral(literal) ? literal : undefined;
}

/**
 * Turns a value into a pretty string. Objects get turned to JSON.
 *
 * @param literal
 * @param nullAsEmpty
 */
export function stringifyUnknown(literal: unknown, nullAsEmpty: boolean): string {
	if (Array.isArray(literal)) {
		return literal.map(x => recStringifyUnknown(x, nullAsEmpty)).join(', ');
	}
	return recStringifyUnknown(literal, nullAsEmpty);
}

function recStringifyUnknown(literal: unknown, nullAsEmpty: boolean): string {
	if (typeof literal === 'object') {
		return JSON.stringify(literal);
	}
	return literal?.toString() ?? (nullAsEmpty ? '' : 'null');
}

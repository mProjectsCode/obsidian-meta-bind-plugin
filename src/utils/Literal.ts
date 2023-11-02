import { Parser } from '@lemons_dev/parsinom/lib/Parser';
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

export function parseUnknownToLiteralArray(value: unknown): MBLiteral[] | undefined {
	if (value === undefined || value === null) {
		return undefined;
	}

	if (isLiteral(value)) {
		return [value];
	}

	if (typeof value === 'object' && Array.isArray(value)) {
		return value.filter(x => isLiteral(x)) as MBLiteral[];
	}

	return undefined;
}

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

export function parseUnknownToString(literal: unknown): string | undefined {
	return isLiteral(literal) ? literal?.toString() : undefined;
}

export function parseUnknownToLiteral(literal: unknown): MBLiteral | undefined {
	return isLiteral(literal) ? literal : undefined;
}

export function stringifyUnknown(literal: unknown): string {
	if (Array.isArray(literal)) {
		return literal.map(x => recStringifyUnknown(x)).join(', ');
	}
	return recStringifyUnknown(literal);
}

function recStringifyUnknown(literal: unknown): string {
	if (typeof literal === 'object') {
		return JSON.stringify(literal);
	}
	return literal?.toString() ?? 'null';
}

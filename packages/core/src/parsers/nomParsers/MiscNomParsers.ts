import type { Parser } from '@lemons_dev/parsinom/lib/Parser';
import { P_UTILS } from '@lemons_dev/parsinom/lib/ParserUtils';
import { P } from '@lemons_dev/parsinom/lib/ParsiNOM';
import { P_Ident } from 'packages/core/src/parsers/nomParsers/GeneralNomParsers';
import { LineNumberExpression, lineNumberOpFromString } from 'packages/core/src/utils/LineNumberExpression';

export const P_float: Parser<number> = P.sequenceMap(
	(sign, number) => (sign === undefined ? number : -number),
	P.string('-').optional(),
	P.or(
		P.sequenceMap((a, b, c) => Number(a + b + c), P_UTILS.digits(), P.string('.'), P_UTILS.digits()),
		P_UTILS.digits().map(x => Number(x)),
	),
).thenEof();

export const P_int: Parser<number> = P.sequenceMap(
	(sign, number) => (sign === undefined ? number : -number),
	P.string('-').optional(),
	P_UTILS.digits().map(x => Number(x)),
).thenEof();

export const P_lineNumberExpression = P.or(
	P.sequenceMap(
		(ident, op, number) => new LineNumberExpression(ident, lineNumberOpFromString(op), number),
		P_Ident,
		P.or(P.string('+'), P.string('-')).trim(P_UTILS.optionalWhitespace()),
		P_int,
	),
	P_Ident.map(ident => new LineNumberExpression(ident, undefined, undefined)),
	P_int.map(number => new LineNumberExpression(undefined, undefined, number)),
);

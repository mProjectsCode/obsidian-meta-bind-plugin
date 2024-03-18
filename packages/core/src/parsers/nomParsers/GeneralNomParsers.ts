import { type ParsingRange } from '@lemons_dev/parsinom/lib/HelperTypes';
import { type Parser } from '@lemons_dev/parsinom/lib/Parser';
import { P_UTILS } from '@lemons_dev/parsinom/lib/ParserUtils';
import { P } from '@lemons_dev/parsinom/lib/ParsiNOM';

export const P_Ident: Parser<string> = P.sequence(
	P.or(P_UTILS.unicodeLetter(), P.oneOf('_$')),
	P.or(P_UTILS.unicodeAlphanumeric(), P.oneOf('-_$')).many(),
)
	.map(x => {
		return x[0] + x[1].join('');
	})
	.describe('identifier');

export const P_IdentWithSpaces: Parser<string> = P.sequenceMap(
	(a, b) => {
		return a + b.map(x => x[0] + x[1]).join('');
	},
	P_Ident,
	P.sequence(P_UTILS.optionalWhitespace(), P_Ident).many(),
).describe('identifier with spaces');

export const P_EscapeCharacter: Parser<string> = P.string('\\')
	.then(P_UTILS.any())
	.map(escaped => {
		if (escaped === "'") {
			return "'";
		} else if (escaped === '\\') {
			return '\\';
		} else {
			return '\\' + escaped;
		}
	});

function createStringParser(quotes: string): Parser<string> {
	return P.or(P_EscapeCharacter, P.noneOf(quotes + '\\'))
		.many()
		.map(x => x.join(''))
		.trim(P.string(quotes));
}

export const P_SingleQuotedString: Parser<string> = createStringParser("'");
export const P_DoubleQuotedString: Parser<string> = createStringParser('"');

export const P_FilePath: Parser<string> = P.manyNotOf('{}[]#^|:?').box('file path');

export interface ParsingResultNode {
	value: string;
	position?: ParsingRange;
}

export function createResultNode(value: string, range: ParsingRange): ParsingResultNode {
	return {
		value: value,
		position: range,
	};
}

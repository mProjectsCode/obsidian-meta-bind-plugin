import { P } from '@lemons_dev/parsinom/lib/ParsiNOM';
import { runParser } from './ParsingError';
import { P_UTILS } from '@lemons_dev/parsinom/lib/ParserUtils';

const buttonParser = P.sequenceMap(
	(_, b) => b,
	P.string('BUTTON'),
	P.manyNotOf('[],^').separateBy(P.string(',').trim(P_UTILS.optionalWhitespace())).wrapString('[', ']'),
);

export class ButtonParser {
	static parseString(input: string): string[] {
		return runParser(buttonParser, input);
	}
}

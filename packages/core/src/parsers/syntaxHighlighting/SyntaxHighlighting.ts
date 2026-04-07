import type { ParsingError } from 'packages/core/src/parsers/ParsingError';
import { Highlight } from 'packages/core/src/parsers/syntaxHighlighting/Highlight';
import { MB_TokenClass } from 'packages/core/src/parsers/syntaxHighlighting/HLPUtils';

export class SyntaxHighlighting {
	str: string;
	highlights: Highlight[];
	parsingError?: ParsingError;

	constructor(str: string, highlights: Highlight[], parsingError?: ParsingError) {
		this.str = str;
		this.highlights = highlights.filter(x => x.range.from !== x.range.to);
		this.parsingError = parsingError;
	}

	getHighlights(): Highlight[] {
		if (this.parsingError === undefined) {
			return this.highlights;
		}

		const errorFrom = this.parsingError.parseFailure.furthest;
		const errorTo = errorFrom + 1;

		return [
			new Highlight(
				{
					from: errorFrom,
					to: errorTo,
				},
				MB_TokenClass.ERROR,
			),
		];
	}
}

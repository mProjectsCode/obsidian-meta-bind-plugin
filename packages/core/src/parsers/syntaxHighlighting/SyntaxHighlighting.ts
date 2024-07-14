import type { ParsingPosition } from '@lemons_dev/parsinom/lib/HelperTypes';
import type { ParsingError } from 'packages/core/src/parsers/ParsingError';
import { Highlight } from 'packages/core/src/parsers/syntaxHighlighting/Highlight';
import { MB_TokenClass } from 'packages/core/src/parsers/syntaxHighlighting/HLPUtils';

export class SyntaxHighlighting {
	str: string;
	highlights: Highlight[];
	parsingError?: ParsingError;

	constructor(str: string, highlights: Highlight[], parsingError?: ParsingError) {
		this.str = str;
		this.highlights = highlights.filter(x => x.range.from.index !== x.range.to.index);
		this.parsingError = parsingError;
	}

	getHighlights(): Highlight[] {
		if (this.parsingError === undefined) {
			return this.highlights;
		}

		let errorTo: ParsingPosition;

		if (this.str[this.parsingError.parseFailure.furthest.index] === '\n') {
			errorTo = {
				index: this.parsingError.parseFailure.furthest.index + 1,
				column: 1,
				line: this.parsingError.parseFailure.furthest.line + 1,
			};
		} else {
			errorTo = {
				index: this.parsingError.parseFailure.furthest.index + 1,
				column: this.parsingError.parseFailure.furthest.column + 1,
				line: this.parsingError.parseFailure.furthest.line,
			};
		}

		return [
			new Highlight(
				{
					from: this.parsingError.parseFailure.furthest,
					to: errorTo,
				},
				MB_TokenClass.ERROR,
			),
		];
	}
}

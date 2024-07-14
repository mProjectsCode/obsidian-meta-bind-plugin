import type { Parser } from '@lemons_dev/parsinom/lib/Parser';
import { P } from '@lemons_dev/parsinom/lib/ParsiNOM';
import { Highlight } from 'packages/core/src/parsers/syntaxHighlighting/Highlight';

export enum MB_TokenClass {
	IDENT = 'ident',
	CONTROL = 'control',
	STRING = 'string',
	KEYWORD = 'keyword',
	ERROR = 'error',
}

export class HLPUtils {
	static sequence(...parsers: Parser<Highlight[] | Highlight[][] | undefined>[]): Parser<Highlight[]> {
		return P.sequenceMap(
			(...highlights) => {
				return highlights.flat(2).filter((x): x is Highlight => x !== undefined);
			},
			...parsers,
		);
	}

	static separateBy(parser: Parser<Highlight[]>, separator: Parser<Highlight[]>): Parser<Highlight[]> {
		return HLPUtils.sequence(parser, HLPUtils.sequence(separator, parser).many()).optional([]);
	}

	static highlight(parser: Parser<unknown>, tokenClass: MB_TokenClass): Parser<Highlight[]> {
		return parser.node((_node, range) => {
			return [new Highlight(range, tokenClass)];
		});
	}

	static highlightStr(str: string, tokenClass: MB_TokenClass): Parser<Highlight[]> {
		return HLPUtils.highlight(P.string(str), tokenClass);
	}
}

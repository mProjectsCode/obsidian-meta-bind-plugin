import { type Parser } from '@lemons_dev/parsinom/lib/Parser';
import { Highlight } from '../api/SyntaxHighlightingAPI';
import { P } from '@lemons_dev/parsinom/lib/ParsiNOM';
import { ident, nonStringArgumentValue, singleQuotedString } from './nomParsers/GeneralNomParsers';
import { P_UTILS } from '@lemons_dev/parsinom/lib/ParserUtils';
import { filePath, metadataPath } from './nomParsers/BindTargetNomParsers';
import { viewFieldContent } from './nomParsers/ViewFieldNomParsers';

export enum MB_TokenClass {
	IDENT = 'ident',
	CONTROL = 'control',
	STRING = 'string',
	KEYWORD = 'keyword',
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
		return HLPUtils.sequence(parser, HLPUtils.sequence(separator, parser).many());
	}

	static highlight(parser: Parser<unknown>, tokenClass: string): Parser<Highlight[]> {
		return parser.node((_node, range) => {
			return [new Highlight(range, tokenClass)];
		});
	}

	static highlightStr(str: string, tokenClass: string): Parser<Highlight[]> {
		return HLPUtils.highlight(P.string(str), tokenClass);
	}
}

const identHLP = HLPUtils.highlight(ident, MB_TokenClass.IDENT);
const keywordHLP = HLPUtils.highlight(ident, MB_TokenClass.KEYWORD);
const commaHLP = HLPUtils.highlightStr(',', MB_TokenClass.CONTROL);
const parenLHLP = HLPUtils.highlightStr('(', MB_TokenClass.CONTROL);
const parenRHLP = HLPUtils.highlightStr(')', MB_TokenClass.CONTROL);
const bracketLHLP = HLPUtils.highlightStr('[', MB_TokenClass.CONTROL);
const bracketRHLP = HLPUtils.highlightStr(']', MB_TokenClass.CONTROL);
const singleQuotedStringHPL = HLPUtils.highlight(singleQuotedString, MB_TokenClass.STRING);

const nonStringArgumentValueHLP = HLPUtils.highlight(nonStringArgumentValue, MB_TokenClass.IDENT);
const argumentValueHLP = P.or(nonStringArgumentValueHLP, singleQuotedStringHPL);
const argumentValuesHLP = HLPUtils.separateBy(argumentValueHLP, commaHLP.trim(P_UTILS.optionalWhitespace()));
const fieldArgumentHLP = HLPUtils.sequence(
	keywordHLP,
	HLPUtils.sequence(parenLHLP, argumentValuesHLP.trim(P_UTILS.optionalWhitespace()), parenRHLP).optional(),
);
const fieldArgumentsHLP = HLPUtils.separateBy(fieldArgumentHLP, commaHLP.trim(P_UTILS.optionalWhitespace()));

export const BIND_TARGET_HLP: Parser<Highlight[]> = HLPUtils.sequence(
	HLPUtils.sequence(identHLP, HLPUtils.highlightStr('^', MB_TokenClass.CONTROL)).optional(),
	HLPUtils.sequence(
		HLPUtils.highlight(filePath, MB_TokenClass.IDENT),
		HLPUtils.highlightStr('#', MB_TokenClass.CONTROL),
	).optional(),
	HLPUtils.highlight(metadataPath, MB_TokenClass.IDENT),
);

const inputFieldDeclarationHLP = HLPUtils.sequence(
	keywordHLP,
	HLPUtils.sequence(parenLHLP, fieldArgumentsHLP.trim(P_UTILS.optionalWhitespace()), parenRHLP).optional(),
	HLPUtils.sequence(HLPUtils.highlightStr(':', MB_TokenClass.CONTROL), BIND_TARGET_HLP).optional(),
);

const partialInputFieldDeclarationHLP = HLPUtils.sequence(
	keywordHLP.optional(),
	HLPUtils.sequence(parenLHLP, fieldArgumentsHLP.trim(P_UTILS.optionalWhitespace()), parenRHLP).optional(),
	HLPUtils.sequence(HLPUtils.highlightStr(':', MB_TokenClass.CONTROL), BIND_TARGET_HLP).optional(),
);

export const INPUT_FIELD_DECLARATION_HLP: Parser<Highlight[]> = P.or(
	HLPUtils.sequence(
		HLPUtils.highlightStr('INPUT', MB_TokenClass.CONTROL),
		bracketLHLP,
		identHLP,
		bracketRHLP,
		bracketLHLP,
		partialInputFieldDeclarationHLP,
		bracketRHLP,
	),
	HLPUtils.sequence(
		HLPUtils.highlightStr('INPUT', MB_TokenClass.CONTROL),
		bracketLHLP,
		inputFieldDeclarationHLP,
		bracketRHLP,
	),
);

const viewFieldContentHLP = HLPUtils.highlight(viewFieldContent, MB_TokenClass.IDENT);
const wrappedBindTargetHLP = HLPUtils.sequence(
	HLPUtils.highlightStr('{', MB_TokenClass.STRING),
	BIND_TARGET_HLP,
	HLPUtils.highlightStr('}', MB_TokenClass.STRING),
);

const viewFieldDeclarationHLP = HLPUtils.sequence(
	viewFieldContentHLP,
	HLPUtils.sequence(wrappedBindTargetHLP, viewFieldContentHLP).many(),
);

const viewFieldExtraDeclarationHLP = HLPUtils.sequence(
	keywordHLP.optional(),
	HLPUtils.sequence(parenLHLP, fieldArgumentsHLP.trim(P_UTILS.optionalWhitespace()).optional(), parenRHLP).optional(),
	HLPUtils.sequence(HLPUtils.highlightStr(':', MB_TokenClass.CONTROL), BIND_TARGET_HLP).optional(),
);

export const VIEW_FIELD_DECLARATION_HLP: Parser<Highlight[]> = HLPUtils.sequence(
	HLPUtils.highlightStr('VIEW', MB_TokenClass.CONTROL),
	bracketLHLP,
	viewFieldDeclarationHLP,
	bracketRHLP,
	HLPUtils.sequence(bracketLHLP, viewFieldExtraDeclarationHLP, bracketRHLP).optional(),
);

export const INLINE_BUTTON_DECLARATION_HLP: Parser<Highlight[]> = HLPUtils.sequence(
	HLPUtils.highlightStr('BUTTON', MB_TokenClass.CONTROL),
	bracketLHLP,
	HLPUtils.separateBy(identHLP, commaHLP.trim(P_UTILS.optionalWhitespace())),
	bracketRHLP,
);

import { P_UTILS } from '@lemons_dev/parsinom/lib/ParserUtils';
import { type Parser } from '@lemons_dev/parsinom/lib/Parser';
import { type Highlight } from './Highlight';
import { filePath, metadataPath } from '../nomParsers/BindTargetNomParsers';
import { P } from '@lemons_dev/parsinom/lib/ParsiNOM';
import { ident, nonStringArgumentValue, singleQuotedString } from '../nomParsers/GeneralNomParsers';
import { viewFieldContent } from '../nomParsers/ViewFieldNomParsers';
import { HLPUtils, MB_TokenClass } from './HLPUtils';

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
	keywordHLP.trim(P_UTILS.optionalWhitespace()),
	HLPUtils.sequence(parenLHLP, fieldArgumentsHLP.trim(P_UTILS.optionalWhitespace()), parenRHLP)
		.trim(P_UTILS.optionalWhitespace())
		.optional(),
	HLPUtils.sequence(
		HLPUtils.highlightStr(':', MB_TokenClass.CONTROL).trim(P_UTILS.optionalWhitespace()),
		BIND_TARGET_HLP,
	)
		.trim(P_UTILS.optionalWhitespace())
		.optional(),
);
const partialInputFieldDeclarationHLP = HLPUtils.sequence(
	keywordHLP.trim(P_UTILS.optionalWhitespace()).optional(),
	HLPUtils.sequence(parenLHLP, fieldArgumentsHLP.trim(P_UTILS.optionalWhitespace()), parenRHLP)
		.trim(P_UTILS.optionalWhitespace())
		.optional(),
	HLPUtils.sequence(
		HLPUtils.highlightStr(':', MB_TokenClass.CONTROL).trim(P_UTILS.optionalWhitespace()),
		BIND_TARGET_HLP,
	)
		.trim(P_UTILS.optionalWhitespace())
		.optional(),
);
export const INPUT_FIELD_DECLARATION_HLP: Parser<Highlight[]> = P.or(
	HLPUtils.sequence(
		HLPUtils.highlightStr('INPUT', MB_TokenClass.CONTROL),
		bracketLHLP,
		identHLP.trim(P_UTILS.optionalWhitespace()),
		bracketRHLP.skip(P_UTILS.optionalWhitespace()),
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
	keywordHLP.trim(P_UTILS.optionalWhitespace()).optional(),
	HLPUtils.sequence(parenLHLP, fieldArgumentsHLP.trim(P_UTILS.optionalWhitespace()).optional(), parenRHLP)
		.trim(P_UTILS.optionalWhitespace())
		.optional(),
	HLPUtils.sequence(
		HLPUtils.highlightStr(':', MB_TokenClass.CONTROL).trim(P_UTILS.optionalWhitespace()),
		BIND_TARGET_HLP,
	)
		.trim(P_UTILS.optionalWhitespace())
		.optional(),
);
export const VIEW_FIELD_DECLARATION_HLP: Parser<Highlight[]> = HLPUtils.sequence(
	HLPUtils.highlightStr('VIEW', MB_TokenClass.CONTROL),
	bracketLHLP,
	viewFieldDeclarationHLP,
	bracketRHLP,
	HLPUtils.sequence(
		bracketLHLP.skip(P_UTILS.optionalWhitespace()),
		viewFieldExtraDeclarationHLP,
		bracketRHLP,
	).optional(),
);
export const INLINE_BUTTON_DECLARATION_HLP: Parser<Highlight[]> = HLPUtils.sequence(
	HLPUtils.highlightStr('BUTTON', MB_TokenClass.CONTROL),
	bracketLHLP,
	HLPUtils.separateBy(identHLP, commaHLP.trim(P_UTILS.optionalWhitespace())),
	bracketRHLP,
);

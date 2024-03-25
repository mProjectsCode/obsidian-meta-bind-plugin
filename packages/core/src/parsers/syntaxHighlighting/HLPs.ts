import { type Parser } from '@lemons_dev/parsinom/lib/Parser';
import { P_UTILS } from '@lemons_dev/parsinom/lib/ParserUtils';
import { P } from '@lemons_dev/parsinom/lib/ParsiNOM';
import { P_MetadataPath } from 'packages/core/src/parsers/nomParsers/BindTargetNomParsers';
import { P_FilePath, P_Ident, P_SingleQuotedString } from 'packages/core/src/parsers/nomParsers/GeneralNomParsers';
import { P_ViewFieldTemplateString } from 'packages/core/src/parsers/nomParsers/ViewFieldNomParsers';
import { HLPUtils, MB_TokenClass } from 'packages/core/src/parsers/syntaxHighlighting/HLPUtils';
import { type Highlight } from 'packages/core/src/parsers/syntaxHighlighting/Highlight';
import { P_NonStringArgumentValue } from 'packages/core/src/parsers/nomParsers/FieldArgumentNomParsers';

const HLP_Ident = HLPUtils.highlight(P_Ident, MB_TokenClass.IDENT);
const HLP_Keyword = HLPUtils.highlight(P_Ident, MB_TokenClass.KEYWORD);
const HLP_Comma = HLPUtils.highlightStr(',', MB_TokenClass.CONTROL);
const HLP_ParenL = HLPUtils.highlightStr('(', MB_TokenClass.CONTROL);
const HLP_ParenR = HLPUtils.highlightStr(')', MB_TokenClass.CONTROL);
const HLP_BracketL = HLPUtils.highlightStr('[', MB_TokenClass.CONTROL);
const HLP_BracketR = HLPUtils.highlightStr(']', MB_TokenClass.CONTROL);
const HLP_SingleQuotedString = HLPUtils.highlight(P_SingleQuotedString, MB_TokenClass.STRING);

const HLP_NonStringArgumentValue = HLPUtils.highlight(P_NonStringArgumentValue, MB_TokenClass.IDENT);
const HLP_ArgumentValue = P.or(HLP_NonStringArgumentValue, HLP_SingleQuotedString);
const HLP_ArgumentValues = HLPUtils.separateBy(HLP_ArgumentValue, HLP_Comma.trim(P_UTILS.optionalWhitespace()));
const HLP_FieldArgument = HLPUtils.sequence(
	HLP_Keyword,
	HLPUtils.sequence(HLP_ParenL, HLP_ArgumentValues.trim(P_UTILS.optionalWhitespace()), HLP_ParenR).optional(),
);
const HLP_FieldArguments = HLPUtils.separateBy(HLP_FieldArgument, HLP_Comma.trim(P_UTILS.optionalWhitespace()));

export const HLP_BindTarget: Parser<Highlight[]> = HLPUtils.sequence(
	HLPUtils.sequence(HLP_Ident, HLPUtils.highlightStr('^', MB_TokenClass.CONTROL)).optional(),
	HLPUtils.sequence(
		HLPUtils.highlight(P_FilePath, MB_TokenClass.IDENT),
		HLPUtils.highlightStr('#', MB_TokenClass.CONTROL),
	).optional(),
	HLPUtils.highlight(P_MetadataPath, MB_TokenClass.IDENT),
);

const HLP_InnerInputFieldDeclaration = HLPUtils.sequence(
	HLP_Keyword.trim(P_UTILS.optionalWhitespace()),
	HLPUtils.sequence(HLP_ParenL, HLP_FieldArguments.trim(P_UTILS.optionalWhitespace()), HLP_ParenR)
		.trim(P_UTILS.optionalWhitespace())
		.optional(),
	HLPUtils.sequence(
		HLPUtils.highlightStr(':', MB_TokenClass.CONTROL).trim(P_UTILS.optionalWhitespace()),
		HLP_BindTarget,
	)
		.trim(P_UTILS.optionalWhitespace())
		.optional(),
);
const HLP_InnerPartialInputFieldDeclaration = HLPUtils.sequence(
	HLP_Keyword.trim(P_UTILS.optionalWhitespace()).optional(),
	HLPUtils.sequence(HLP_ParenL, HLP_FieldArguments.trim(P_UTILS.optionalWhitespace()), HLP_ParenR)
		.trim(P_UTILS.optionalWhitespace())
		.optional(),
	HLPUtils.sequence(
		HLPUtils.highlightStr(':', MB_TokenClass.CONTROL).trim(P_UTILS.optionalWhitespace()),
		HLP_BindTarget,
	)
		.trim(P_UTILS.optionalWhitespace())
		.optional(),
);
export const HLP_InputFieldDeclaration: Parser<Highlight[]> = P.or(
	HLPUtils.sequence(
		HLPUtils.highlightStr('INPUT', MB_TokenClass.CONTROL),
		HLP_BracketL,
		HLP_Ident.trim(P_UTILS.optionalWhitespace()),
		HLP_BracketR.skip(P_UTILS.optionalWhitespace()),
		HLP_BracketL,
		HLP_InnerPartialInputFieldDeclaration,
		HLP_BracketR,
	),
	HLPUtils.sequence(
		HLPUtils.highlightStr('INPUT', MB_TokenClass.CONTROL),
		HLP_BracketL,
		HLP_InnerInputFieldDeclaration,
		HLP_BracketR,
	),
);

const HLP_ViewFieldTemplateString = HLPUtils.highlight(P_ViewFieldTemplateString, MB_TokenClass.IDENT);
const HLP_ViewFieldWrappedBindTarget = HLPUtils.sequence(
	HLPUtils.highlightStr('{', MB_TokenClass.STRING),
	HLP_BindTarget,
	HLPUtils.highlightStr('}', MB_TokenClass.STRING),
);
const HLP_ViewFieldTemplate = HLPUtils.sequence(
	HLP_ViewFieldTemplateString,
	HLPUtils.sequence(HLP_ViewFieldWrappedBindTarget, HLP_ViewFieldTemplateString).many(),
);
const HLP_InnerViewFieldDeclaration = HLPUtils.sequence(
	HLP_Keyword.trim(P_UTILS.optionalWhitespace()).optional(),
	HLPUtils.sequence(HLP_ParenL, HLP_FieldArguments.trim(P_UTILS.optionalWhitespace()).optional(), HLP_ParenR)
		.trim(P_UTILS.optionalWhitespace())
		.optional(),
	HLPUtils.sequence(
		HLPUtils.highlightStr(':', MB_TokenClass.CONTROL).trim(P_UTILS.optionalWhitespace()),
		HLP_BindTarget,
	)
		.trim(P_UTILS.optionalWhitespace())
		.optional(),
);
export const HLP_ViewFieldDeclaration: Parser<Highlight[]> = HLPUtils.sequence(
	HLPUtils.highlightStr('VIEW', MB_TokenClass.CONTROL),
	HLP_BracketL,
	HLP_ViewFieldTemplate,
	HLP_BracketR,
	HLPUtils.sequence(
		HLP_BracketL.skip(P_UTILS.optionalWhitespace()),
		HLP_InnerViewFieldDeclaration,
		HLP_BracketR,
	).optional(),
);
export const HLP_ButtonGroupDeclaration: Parser<Highlight[]> = HLPUtils.sequence(
	HLPUtils.highlightStr('BUTTON', MB_TokenClass.CONTROL),
	HLP_BracketL,
	HLPUtils.separateBy(HLP_Ident, HLP_Comma.trim(P_UTILS.optionalWhitespace())),
	HLP_BracketR,
);

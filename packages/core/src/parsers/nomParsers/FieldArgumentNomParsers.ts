import type { Parser } from '@lemons_dev/parsinom/lib/Parser';
import { P } from '@lemons_dev/parsinom/lib/ParsiNOM';
import { P_UTILS } from '@lemons_dev/parsinom/lib/ParserUtils';
import {
	createResultNode,
	P_Ident,
	P_SingleQuotedString,
	type ParsingResultNode,
} from 'packages/core/src/parsers/nomParsers/GeneralNomParsers';

export const P_NonStringArgumentValue: Parser<string> = P.regexp(/^[^()',]+/).describe(
	'any character except parentheses, single quotation marks and commas',
);
export const P_ArgumentValue: Parser<ParsingResultNode> = P.or(P_SingleQuotedString, P_NonStringArgumentValue).node(
	createResultNode,
);
export const P_ArgumentValues: Parser<ParsingResultNode[]> = P.separateBy(
	P_ArgumentValue,
	P.string(',').describe('argument value separator ","').trim(P_UTILS.optionalWhitespace()),
);

export const P_FieldArgument: Parser<UnvalidatedFieldArgument> = P.sequenceMap(
	(name, value): UnvalidatedFieldArgument => {
		return {
			name: name,
			value: value,
		};
	},
	P_Ident.node(createResultNode),
	P_ArgumentValues.trim(P_UTILS.optionalWhitespace())
		.wrap(P.string('(').describe('argument value paren "("'), P.string(')').describe('argument value paren ")"'))
		.optional([] as ParsingResultNode[]),
);
export const P_FieldArguments: Parser<UnvalidatedFieldArgument[]> = P.separateBy(
	P_FieldArgument,
	P.string(',').describe('argument separator ","').trim(P_UTILS.optionalWhitespace()),
);

export interface UnvalidatedFieldArgument {
	name: ParsingResultNode;
	value: ParsingResultNode[];
}

export interface SimpleFieldArgument {
	name: string;
	value: string[];
}

import { P } from '@lemons_dev/parsinom/lib/ParsiNOM';
import { ident, identWithSpaces, singleQuotedString } from './GeneralParsers';
import { Parser } from '@lemons_dev/parsinom/lib/Parser';
import { createResultNode, ParsingResultNode } from '../inputFieldParser/InputFieldParser';
import { P_UTILS } from '@lemons_dev/parsinom/lib/ParserUtils';
import { PartialUnvalidatedInputFieldDeclaration, UnvalidatedInputFieldArgument } from '../inputFieldParser/InputFieldDeclaration';
import { BIND_TARGET } from './BindTargetParsers';

const nonStringArgumentValue: Parser<string> = P.regexp(/^[^()',]+/).describe('any character except parentheses, single quotation marks and commas');

const argumentValue: Parser<ParsingResultNode> = P.or(singleQuotedString, nonStringArgumentValue).node(createResultNode);

const argumentValues: Parser<ParsingResultNode[]> = P.separateBy(argumentValue, P.string(',').trim(P_UTILS.optionalWhitespace()));

const inputFieldArgument: Parser<UnvalidatedInputFieldArgument> = P.sequenceMap(
	(name, value): UnvalidatedInputFieldArgument => {
		return {
			name: name,
			value: value,
		};
	},
	ident.node(createResultNode),
	argumentValues
		.trim(P_UTILS.optionalWhitespace())
		.wrap(P.string('('), P.string(')'))
		.optional([] as ParsingResultNode[])
);

const inputFieldArguments: Parser<UnvalidatedInputFieldArgument[]> = P.separateBy(inputFieldArgument, P.string(',').trim(P_UTILS.optionalWhitespace()));

export const INPUT_FIELD_DECLARATION: Parser<PartialUnvalidatedInputFieldDeclaration> = P.sequenceMap(
	(type, args, b) => {
		const bindTarget = b === undefined ? undefined : b[1];
		return {
			inputFieldType: type,
			arguments: args,
			bindTarget: bindTarget,
		};
	},
	ident.node(createResultNode).describe('input field type'),
	inputFieldArguments
		.trim(P_UTILS.optionalWhitespace())
		.wrap(P.string('('), P.string(')'))
		.optional([] as UnvalidatedInputFieldArgument[]),
	P.sequence(P.string(':'), BIND_TARGET).optional()
);

export const PARTIAL_INPUT_FIELD_DECLARATION: Parser<PartialUnvalidatedInputFieldDeclaration> = P.sequenceMap(
	(type, args, b) => {
		const bindTarget = b === undefined ? undefined : b[1];
		return {
			inputFieldType: type,
			arguments: args,
			bindTarget: bindTarget,
		};
	},
	ident.node(createResultNode).optional().describe('input field type'),
	inputFieldArguments
		.trim(P_UTILS.optionalWhitespace())
		.wrap(P.string('('), P.string(')'))
		.optional([] as UnvalidatedInputFieldArgument[]),
	P.sequence(P.string(':'), BIND_TARGET).optional()
);

export const INPUT_FIELD_FULL_DECLARATION: Parser<PartialUnvalidatedInputFieldDeclaration> = P.or(
	P.sequenceMap(
		(_1, templateName, _2, declaration, _3) => {
			declaration.templateName = templateName;
			return declaration;
		},
		P.string('INPUT'),
		P.sequenceMap((_1, templateName, _2) => templateName, P.string('['), identWithSpaces.node(createResultNode).describe('template name'), P.string(']')),
		P.string('['),
		PARTIAL_INPUT_FIELD_DECLARATION,
		P.string(']'),
		P_UTILS.eof()
	),
	P.sequenceMap(
		(_1, _2, declaration, _3) => {
			return declaration;
		},
		P.string('INPUT'),
		P.string('['),
		INPUT_FIELD_DECLARATION,
		P.string(']'),
		P_UTILS.eof()
	)
);

export const TEMPLATE_INPUT_FIELD_FULL_DECLARATION: Parser<PartialUnvalidatedInputFieldDeclaration> = P.sequenceMap(
	(_1, _2, declaration, _3) => {
		return declaration;
	},
	P.string('INPUT'),
	P.string('['),
	PARTIAL_INPUT_FIELD_DECLARATION,
	P.string(']'),
	P_UTILS.eof()
);

import { P } from '@lemons_dev/parsinom/lib/ParsiNOM';
import { createResultNode, fieldArguments, ident, identWithSpaces } from 'packages/core/src/parsers/nomParsers/GeneralNomParsers';
import { type Parser } from '@lemons_dev/parsinom/lib/Parser';
import { P_UTILS } from '@lemons_dev/parsinom/lib/ParserUtils';
import {
	type PartialUnvalidatedInputFieldDeclaration,
	type UnvalidatedFieldArgument,
} from 'packages/core/src/parsers/inputFieldParser/InputFieldDeclaration';
import { BIND_TARGET } from 'packages/core/src/parsers/nomParsers/BindTargetNomParsers';

export const INPUT_FIELD_DECLARATION: Parser<PartialUnvalidatedInputFieldDeclaration> = P.sequenceMap(
	(type, args, b) => {
		const bindTarget = b === undefined ? undefined : b[1];
		return {
			inputFieldType: type,
			arguments: args,
			bindTarget: bindTarget,
		} satisfies PartialUnvalidatedInputFieldDeclaration;
	},
	ident.node(createResultNode).trim(P_UTILS.optionalWhitespace()).describe('input field type'),
	fieldArguments
		.trim(P_UTILS.optionalWhitespace())
		.wrap(P.string('(').describe('arguments paren "("'), P.string(')').describe('arguments paren ")"'))
		.trim(P_UTILS.optionalWhitespace())
		.optional([] as UnvalidatedFieldArgument[]),
	P.sequence(P.string(':').trim(P_UTILS.optionalWhitespace()).describe('bind target separator ":"'), BIND_TARGET)
		.trim(P_UTILS.optionalWhitespace())
		.optional(),
);

export const PARTIAL_INPUT_FIELD_DECLARATION: Parser<PartialUnvalidatedInputFieldDeclaration> = P.sequenceMap(
	(type, args, b) => {
		const bindTarget = b === undefined ? undefined : b[1];
		return {
			inputFieldType: type,
			arguments: args,
			bindTarget: bindTarget,
		} satisfies PartialUnvalidatedInputFieldDeclaration;
	},
	ident.node(createResultNode).trim(P_UTILS.optionalWhitespace()).optional().describe('input field type'),
	fieldArguments
		.trim(P_UTILS.optionalWhitespace())
		.wrap(P.string('(').describe('arguments paren "("'), P.string(')').describe('arguments paren ")"'))
		.trim(P_UTILS.optionalWhitespace())
		.optional([] as UnvalidatedFieldArgument[]),
	P.sequence(P.string(':').trim(P_UTILS.optionalWhitespace()).describe('bind target separator ":"'), BIND_TARGET)
		.trim(P_UTILS.optionalWhitespace())
		.optional(),
);

export const INPUT_FIELD_FULL_DECLARATION: Parser<PartialUnvalidatedInputFieldDeclaration> = P.or(
	P.sequenceMap(
		(_1, templateName, declaration) => {
			declaration.templateName = templateName;
			return declaration;
		},
		P.string('INPUT'),
		P.sequenceMap(
			(_1, templateName, _2) => templateName,
			P.string('['),
			identWithSpaces.node(createResultNode).trim(P_UTILS.optionalWhitespace()).describe('template name'),
			P.string(']').skip(P_UTILS.optionalWhitespace()),
		),
		PARTIAL_INPUT_FIELD_DECLARATION.wrap(P.string('['), P.string(']')),
		P_UTILS.eof(),
	),
	P.sequenceMap(
		(_1, declaration) => {
			return declaration;
		},
		P.string('INPUT'),
		INPUT_FIELD_DECLARATION.wrap(P.string('['), P.string(']')),
		P_UTILS.eof(),
	),
);

export const TEMPLATE_INPUT_FIELD_FULL_DECLARATION: Parser<PartialUnvalidatedInputFieldDeclaration> = P.sequenceMap(
	(_1, declaration) => {
		return declaration;
	},
	P.string('INPUT'),
	PARTIAL_INPUT_FIELD_DECLARATION.wrap(P.string('['), P.string(']')),
	P_UTILS.eof(),
);

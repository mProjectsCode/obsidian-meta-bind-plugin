import { P } from '@lemons_dev/parsinom/lib/ParsiNOM';
import { createResultNode, fieldArguments, ident, identWithSpaces } from './GeneralParsers';
import { type Parser } from '@lemons_dev/parsinom/lib/Parser';
import { P_UTILS } from '@lemons_dev/parsinom/lib/ParserUtils';
import { type PartialUnvalidatedInputFieldDeclaration, type UnvalidatedFieldArgument } from '../inputFieldParser/InputFieldDeclaration';
import { BIND_TARGET } from './BindTargetParsers';

export const INPUT_FIELD_DECLARATION: Parser<PartialUnvalidatedInputFieldDeclaration> = P.sequenceMap(
	(type, args, b) => {
		const bindTarget = b === undefined ? undefined : b[1];
		return {
			inputFieldType: type,
			arguments: args,
			bindTarget: bindTarget,
		} satisfies PartialUnvalidatedInputFieldDeclaration;
	},
	ident.node(createResultNode).describe('input field type'),
	fieldArguments
		.trim(P_UTILS.optionalWhitespace())
		.wrap(P.string('('), P.string(')'))
		.optional([] as UnvalidatedFieldArgument[]),
	P.sequence(P.string(':'), BIND_TARGET).optional(),
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
	ident.node(createResultNode).optional().describe('input field type'),
	fieldArguments
		.trim(P_UTILS.optionalWhitespace())
		.wrap(P.string('('), P.string(')'))
		.optional([] as UnvalidatedFieldArgument[]),
	P.sequence(P.string(':'), BIND_TARGET).optional(),
);

export const INPUT_FIELD_FULL_DECLARATION: Parser<PartialUnvalidatedInputFieldDeclaration> = P.or(
	P.sequenceMap(
		(_1, templateName, declaration) => {
			declaration.templateName = templateName;
			return declaration;
		},
		P.string('INPUT'),
		P.sequenceMap((_1, templateName, _2) => templateName, P.string('['), identWithSpaces.node(createResultNode).describe('template name'), P.string(']')),
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

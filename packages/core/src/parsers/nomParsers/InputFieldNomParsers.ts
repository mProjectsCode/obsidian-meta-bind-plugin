import { type Parser } from '@lemons_dev/parsinom/lib/Parser';
import { P_UTILS } from '@lemons_dev/parsinom/lib/ParserUtils';
import { P } from '@lemons_dev/parsinom/lib/ParsiNOM';
import { type PartialUnvalidatedInputFieldDeclaration } from 'packages/core/src/parsers/inputFieldParser/InputFieldDeclaration';
import { P_BindTarget } from 'packages/core/src/parsers/nomParsers/BindTargetNomParsers';
import { createResultNode, P_Ident, P_IdentWithSpaces } from 'packages/core/src/parsers/nomParsers/GeneralNomParsers';
import {
	P_FieldArguments,
	type UnvalidatedFieldArgument,
} from 'packages/core/src/parsers/nomParsers/FieldArgumentNomParsers';

export const P_InnerInputFieldDeclaration: Parser<PartialUnvalidatedInputFieldDeclaration> = P.sequenceMap(
	(type, args, b) => {
		const bindTarget = b === undefined ? undefined : b[1];
		return {
			inputFieldType: type,
			arguments: args,
			bindTarget: bindTarget,
		} satisfies PartialUnvalidatedInputFieldDeclaration;
	},
	P_Ident.node(createResultNode).trim(P_UTILS.optionalWhitespace()).describe('input field type'),
	P_FieldArguments.trim(P_UTILS.optionalWhitespace())
		.wrap(P.string('(').describe('arguments paren "("'), P.string(')').describe('arguments paren ")"'))
		.trim(P_UTILS.optionalWhitespace())
		.optional([] as UnvalidatedFieldArgument[]),
	P.sequence(P.string(':').trim(P_UTILS.optionalWhitespace()).describe('bind target separator ":"'), P_BindTarget)
		.trim(P_UTILS.optionalWhitespace())
		.optional(),
);

export const P_InnerPartialInputFieldDeclaration: Parser<PartialUnvalidatedInputFieldDeclaration> = P.sequenceMap(
	(type, args, b) => {
		const bindTarget = b === undefined ? undefined : b[1];
		return {
			inputFieldType: type,
			arguments: args,
			bindTarget: bindTarget,
		} satisfies PartialUnvalidatedInputFieldDeclaration;
	},
	P_Ident.node(createResultNode).trim(P_UTILS.optionalWhitespace()).optional().describe('input field type'),
	P_FieldArguments.trim(P_UTILS.optionalWhitespace())
		.wrap(P.string('(').describe('arguments paren "("'), P.string(')').describe('arguments paren ")"'))
		.trim(P_UTILS.optionalWhitespace())
		.optional([] as UnvalidatedFieldArgument[]),
	P.sequence(P.string(':').trim(P_UTILS.optionalWhitespace()).describe('bind target separator ":"'), P_BindTarget)
		.trim(P_UTILS.optionalWhitespace())
		.optional(),
);

export const P_InputFieldDeclaration: Parser<PartialUnvalidatedInputFieldDeclaration> = P.or(
	P.sequenceMap(
		(_1, templateName, declaration) => {
			declaration.templateName = templateName;
			return declaration;
		},
		P.string('INPUT'),
		P.sequenceMap(
			(_1, templateName, _2) => templateName,
			P.string('['),
			P_IdentWithSpaces.node(createResultNode).trim(P_UTILS.optionalWhitespace()).describe('template name'),
			P.string(']').skip(P_UTILS.optionalWhitespace()),
		),
		P_InnerPartialInputFieldDeclaration.wrap(P.string('['), P.string(']')),
		P_UTILS.eof(),
	),
	P.sequenceMap(
		(_1, declaration) => {
			return declaration;
		},
		P.string('INPUT'),
		P_InnerInputFieldDeclaration.wrap(P.string('['), P.string(']')),
		P_UTILS.eof(),
	),
);

export const P_PartialInputFieldDeclaration: Parser<PartialUnvalidatedInputFieldDeclaration> = P.sequenceMap(
	(_1, declaration) => {
		return declaration;
	},
	P.string('INPUT'),
	P_InnerPartialInputFieldDeclaration.wrap(P.string('['), P.string(']')),
	P_UTILS.eof(),
);

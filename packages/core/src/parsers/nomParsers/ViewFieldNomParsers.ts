import { type Parser } from '@lemons_dev/parsinom/lib/Parser';
import { P_UTILS } from '@lemons_dev/parsinom/lib/ParserUtils';
import { P } from '@lemons_dev/parsinom/lib/ParsiNOM';
import { type UnvalidatedBindTargetDeclaration } from 'packages/core/src/parsers/bindTargetParser/BindTargetDeclaration';
import { P_BindTarget } from 'packages/core/src/parsers/nomParsers/BindTargetNomParsers';
import { createResultNode, P_Ident } from 'packages/core/src/parsers/nomParsers/GeneralNomParsers';
import {
	type PartialUnvalidatedJsViewFieldDeclaration,
	type PartialUnvalidatedViewFieldDeclaration,
	type UnvalidatedJsViewFieldBindTargetMapping,
} from 'packages/core/src/parsers/viewFieldParser/ViewFieldDeclaration';
import {
	P_FieldArguments,
	type UnvalidatedFieldArgument,
} from 'packages/core/src/parsers/nomParsers/FieldArgumentNomParsers';

export const P_ViewFieldContentEscapeCharacter = P.string('\\')
	.then(P_UTILS.any())
	.map(escaped => {
		if (escaped === '[') {
			return '[';
		} else if (escaped === ']') {
			return ']';
		} else if (escaped === '{') {
			return '{';
		} else if (escaped === '}') {
			return '}';
		} else if (escaped === '\\') {
			return '\\';
		} else {
			return '\\' + escaped;
		}
	});

export const P_ViewFieldTemplateString: Parser<string> = P.sequenceMap(
	(first, other) => {
		return first + other.flat().join('');
	},
	P.manyNotOf('{}[]\\'),
	P.sequence(P_ViewFieldContentEscapeCharacter, P.manyNotOf('{}[]\\')).many(),
).box('View Field Content');

export const P_ViewFieldTemplate: Parser<(string | UnvalidatedBindTargetDeclaration)[]> = P.sequenceMap(
	(first, other) => {
		return [first, ...other.flat()];
	},
	P_ViewFieldTemplateString,
	P.sequence(P_BindTarget.wrapString('{', '}'), P_ViewFieldTemplateString).many(),
);

const P_InnerViewFieldDeclaration: Parser<PartialUnvalidatedViewFieldDeclaration> = P.sequenceMap(
	(type, args, b) => {
		const bindTarget = b === undefined ? undefined : b[1];
		return {
			viewFieldType: type,
			writeToBindTarget: bindTarget,
			arguments: args,
			templateDeclaration: undefined,
		} satisfies PartialUnvalidatedViewFieldDeclaration;
	},
	P_Ident.node(createResultNode).trim(P_UTILS.optionalWhitespace()).optional().describe('input field type'),
	P_FieldArguments.trim(P_UTILS.optionalWhitespace())
		.wrapString('(', ')')
		.trim(P_UTILS.optionalWhitespace())
		.optional([] as UnvalidatedFieldArgument[]),
	P.sequence(P.string(':').trim(P_UTILS.optionalWhitespace()), P_BindTarget)
		.trim(P_UTILS.optionalWhitespace())
		.optional(),
);

export const P_ViewFieldDeclaration: Parser<PartialUnvalidatedViewFieldDeclaration> = P.sequenceMap(
	(_1, declaration, _2, extraDeclaration) => {
		if (extraDeclaration === undefined) {
			return {
				viewFieldType: undefined,
				writeToBindTarget: undefined,
				arguments: [],
				templateDeclaration: declaration,
			} satisfies PartialUnvalidatedViewFieldDeclaration;
		} else {
			extraDeclaration.templateDeclaration = declaration;
			return extraDeclaration;
		}
	},
	P.string('VIEW'),
	P_ViewFieldTemplate.wrapString('[', ']'),
	P_UTILS.optionalWhitespace(),
	P_InnerViewFieldDeclaration.wrapString('[', ']').optional(),
	P_UTILS.eof(),
);

const P_JsViewFieldBindTargetMapping: Parser<UnvalidatedJsViewFieldBindTargetMapping> = P.sequenceMap(
	(bindTarget, children, _1, name) => {
		if (children !== undefined) {
			bindTarget.listenToChildren = true;
		}

		return {
			bindTarget: bindTarget,
			name: name,
		} satisfies UnvalidatedJsViewFieldBindTargetMapping;
	},
	P_BindTarget.wrapString('{', '}'),
	P.string(' and children').optional(),
	P.string(' as '),
	P_Ident,
);

export const P_JsViewFieldDeclaration: Parser<PartialUnvalidatedJsViewFieldDeclaration> = P.sequenceMap(
	(bindTargetMappings, writeToBindTarget, code) => {
		return {
			bindTargetMappings: bindTargetMappings,
			writeToBindTarget: writeToBindTarget,
			code: code,
		} satisfies PartialUnvalidatedJsViewFieldDeclaration;
	},
	P_JsViewFieldBindTargetMapping.separateBy(P_UTILS.whitespace()).skip(P_UTILS.whitespace()),
	P.string('save to ').then(P_BindTarget.wrapString('{', '}')).skip(P_UTILS.whitespace()).optional(),
	P.string('---').then(P_UTILS.remaining()),
);

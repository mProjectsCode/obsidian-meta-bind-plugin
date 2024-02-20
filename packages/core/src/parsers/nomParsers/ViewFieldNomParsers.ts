import { P } from '@lemons_dev/parsinom/lib/ParsiNOM';
import { type Parser } from '@lemons_dev/parsinom/lib/Parser';
import { type UnvalidatedFieldArgument } from 'packages/core/src/parsers/inputFieldParser/InputFieldDeclaration';
import { P_UTILS } from '@lemons_dev/parsinom/lib/ParserUtils';
import { BIND_TARGET } from 'packages/core/src/parsers/nomParsers/BindTargetNomParsers';
import { createResultNode, fieldArguments, ident } from 'packages/core/src/parsers/nomParsers/GeneralNomParsers';
import {
	type PartialUnvalidatedViewFieldDeclaration,
	type UnvalidatedJsViewFieldBindTargetMapping,
	type UnvalidatedJsViewFieldDeclaration,
} from 'packages/core/src/parsers/viewFieldParser/ViewFieldDeclaration';
import { type UnvalidatedBindTargetDeclaration } from 'packages/core/src/parsers/bindTargetParser/BindTargetDeclaration';

export const viewFieldContentEscapeCharacter = P.string('\\')
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

export const viewFieldContent: Parser<string> = P.sequenceMap(
	(first, other) => {
		return first + other.flat().join('');
	},
	P.manyNotOf('{}[]\\'),
	P.sequence(viewFieldContentEscapeCharacter, P.manyNotOf('{}[]\\')).many(),
).box('View Field Content');

export const VIEW_FIELD_DECLARATION: Parser<(string | UnvalidatedBindTargetDeclaration)[]> = P.sequenceMap(
	(first, other) => {
		return [first, ...other.flat()];
	},
	viewFieldContent,
	P.sequence(BIND_TARGET.wrapString('{', '}'), viewFieldContent).many(),
);

const viewFieldExtraDeclaration: Parser<PartialUnvalidatedViewFieldDeclaration> = P.sequenceMap(
	(type, args, b) => {
		const bindTarget = b === undefined ? undefined : b[1];
		return {
			viewFieldType: type,
			writeToBindTarget: bindTarget,
			arguments: args,
			templateDeclaration: undefined,
		} satisfies PartialUnvalidatedViewFieldDeclaration;
	},
	ident.node(createResultNode).trim(P_UTILS.optionalWhitespace()).optional().describe('input field type'),
	fieldArguments
		.trim(P_UTILS.optionalWhitespace())
		.wrapString('(', ')')
		.trim(P_UTILS.optionalWhitespace())
		.optional([] as UnvalidatedFieldArgument[]),
	P.sequence(P.string(':').trim(P_UTILS.optionalWhitespace()), BIND_TARGET)
		.trim(P_UTILS.optionalWhitespace())
		.optional(),
);

export const VIEW_FIELD_FULL_DECLARATION: Parser<PartialUnvalidatedViewFieldDeclaration> = P.sequenceMap(
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
	VIEW_FIELD_DECLARATION.wrapString('[', ']'),
	P_UTILS.optionalWhitespace(),
	viewFieldExtraDeclaration.wrapString('[', ']').optional(),
	P_UTILS.eof(),
);

const jsViewFieldBindTargetMapping: Parser<UnvalidatedJsViewFieldBindTargetMapping> = P.sequenceMap(
	(bindTarget, children, _1, name) => {
		if (children !== undefined) {
			bindTarget.listenToChildren = true;
		}

		return {
			bindTarget: bindTarget,
			name: name,
		} satisfies UnvalidatedJsViewFieldBindTargetMapping;
	},
	BIND_TARGET.wrapString('{', '}'),
	P.string(' and children').optional(),
	P.string(' as '),
	ident,
);

export const JS_VIEW_FIELD_DECLARATION: Parser<UnvalidatedJsViewFieldDeclaration> = P.sequenceMap(
	(bindTargetMappings, writeToBindTarget, code) => {
		return {
			bindTargetMappings: bindTargetMappings,
			writeToBindTarget: writeToBindTarget,
			code: code,
		} satisfies UnvalidatedJsViewFieldDeclaration;
	},
	jsViewFieldBindTargetMapping.separateBy(P_UTILS.whitespace()).skip(P_UTILS.whitespace()),
	P.string('save to ').then(BIND_TARGET.wrapString('{', '}')).skip(P_UTILS.whitespace()).optional(),
	P.string('---').then(P_UTILS.remaining()),
);

import { P } from '@lemons_dev/parsinom/lib/ParsiNOM';
import { P_UTILS } from '@lemons_dev/parsinom/lib/ParserUtils';
import { Parser } from '@lemons_dev/parsinom/lib/Parser';
import {
	PartialUnvalidatedInputFieldDeclaration,
	UnvalidatedBindTargetDeclaration,
	UnvalidatedInputFieldArgument,
} from '../newInputFieldParser/InputFieldDeclaration';
import { createResultNode, ParsingResultNode } from '../newInputFieldParser/InputFieldParser';
import {
	JsViewFieldBindTargetMapping,
	JsViewFieldDeclaration,
	UnvalidatedJsViewFieldBindTargetMapping,
	UnvalidatedJsViewFieldDeclaration,
} from '../ViewFieldDeclarationParser';

const quote = `'`;

const ident = P.regexp(/^[a-z][a-z0-9_-]*/i)
	.map(x => {
		// console.log('ident', x);
		return x;
	})
	.describe('identifier');

const spaceIdent = P.sequenceMap(
	(a, b) => {
		return a + b.map(x => x[0] + x[1]).join('');
	},
	ident,
	P.sequence(P_UTILS.optionalWhitespace(), ident).many()
).describe('identifier with spaces');

const escapeCharacter = P.string('\\')
	.then(P_UTILS.any())
	.map(escaped => {
		if (escaped === "'") {
			return "'";
		} else if (escaped === '\\') {
			return '\\';
		} else {
			return '\\' + escaped;
		}
	});

function createStr(quotes: string): Parser<string> {
	return P.string(quotes)
		.then(
			P.or(escapeCharacter, P.noneOf(quotes + '\\'))
				.many()
				.map(x => x.join(''))
		)
		.skip(P.string(quotes));
}

const str = createStr(quote);

const specialIdent = P.regexp(/^[^ \t\n\r()',]+/).describe('any character except whitespace, parentheses, single quotation marks and commas');

const specialSpaceIdent = P.sequenceMap(
	(a, b) => {
		return a + b.map(x => x[0] + x[1]).join('');
	},
	specialIdent,
	P.sequence(P_UTILS.optionalWhitespace(), specialIdent).many()
).describe('any character except parentheses, single quotation marks and commas');

const value = P.or(specialSpaceIdent, str);

const filePath = P.noneOf('{}[]#^|:?')
	.many()
	.map(x => x.join(''))
	.describe('file path');

const bracketMetadataPathPart: Parser<ParsingResultNode> = P.or(P_UTILS.digits(), createStr('"')).wrap(P.string('['), P.string(']')).node(createResultNode);

const firstMetadataPathPart: Parser<ParsingResultNode[]> = P.or(
	bracketMetadataPathPart.atLeast(1),
	P.sequenceMap((ident, brackets) => [ident, ...brackets], ident.node(createResultNode), bracketMetadataPathPart.many())
);

const metadataPathPart: Parser<ParsingResultNode[]> = P.sequenceMap(
	(ident, brackets) => {
		return [ident, ...brackets];
	},
	ident.node(createResultNode),
	bracketMetadataPathPart.many()
);

const metadataPath: Parser<ParsingResultNode[]> = P.sequenceMap(
	(fist, others) => {
		return fist.concat(others.map(x => x[1]).reduce((x, acc) => acc.concat(x), []));
	},
	firstMetadataPathPart,
	P.sequence(P.string('.'), metadataPathPart).many()
);

export const BIND_TARGET: Parser<UnvalidatedBindTargetDeclaration> = P.sequenceMap(
	(a, b) => {
		if (a === undefined) {
			return {
				file: undefined,
				path: b,
			};
		} else {
			return {
				file: a[0],
				path: b,
			};
		}
	},
	P.sequence(filePath.node(createResultNode), P.string('#')).optional(),
	metadataPath
);

const inputFieldArgumentValue: Parser<ParsingResultNode[]> = P.separateBy(value.node(createResultNode), P.string(',').trim(P_UTILS.optionalWhitespace()));

const inputFieldArgument: Parser<UnvalidatedInputFieldArgument> = P.sequenceMap(
	(name, value): UnvalidatedInputFieldArgument => {
		return {
			name: name,
			value: value,
		};
	},
	ident.node(createResultNode),
	inputFieldArgumentValue
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
		P.sequenceMap((_1, templateName, _2) => templateName, P.string('['), spaceIdent.node(createResultNode).describe('template name'), P.string(']')),
		P.string('['),
		PARTIAL_INPUT_FIELD_DECLARATION,
		P.string(']'),
		P_UTILS.eof()
	),
	P.sequenceMap(
		(_1, _2, declaration, _3) => {
			console.warn('second');
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

const viewFieldMathJS = P.noneOf('{}[]')
	.many()
	.map(x => x.join(''))
	.describe('MathJS');

export const VIEW_FIELD_DECLARATION: Parser<(string | UnvalidatedBindTargetDeclaration)[]> = P.sequenceMap(
	(first, other) => {
		return [first, ...other.reduce<(UnvalidatedBindTargetDeclaration | string)[]>((acc, x) => acc.concat(x), [])];
	},
	viewFieldMathJS,
	P.sequence(BIND_TARGET.wrap(P.string('{'), P.string('}')), viewFieldMathJS).many()
);

export const VIEW_FIELD_FULL_DECLARATION: Parser<(string | UnvalidatedBindTargetDeclaration)[]> = P.sequenceMap(
	(_1, _2, declaration, _3) => {
		return declaration;
	},
	P.string('VIEW'),
	P.string('['),
	VIEW_FIELD_DECLARATION,
	P.string(']'),
	P_UTILS.eof()
);

const jsViewFieldBindTargetMapping: Parser<UnvalidatedJsViewFieldBindTargetMapping> = P.sequenceMap(
	(bindTarget, children, _1, name) => {
		return {
			bindTarget: bindTarget,
			listenToChildren: children !== undefined,
			name: name,
		};
	},
	BIND_TARGET.wrap(P.string('{'), P.string('}')),
	P.string(' and children').optional(),
	P.string(' as '),
	ident
);

export const JS_VIEW_FIELD_DECLARATION: Parser<UnvalidatedJsViewFieldDeclaration> = P.sequenceMap(
	(bindTargetMappings, _1, _2, code) => {
		return {
			bindTargetMappings: bindTargetMappings,
			code: code,
		};
	},
	jsViewFieldBindTargetMapping.separateBy(P_UTILS.whitespace()),
	P_UTILS.whitespace(),
	P.string('---'),
	P_UTILS.remaining()
);

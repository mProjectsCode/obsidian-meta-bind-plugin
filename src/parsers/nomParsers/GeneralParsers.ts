import { P } from '@lemons_dev/parsinom/lib/ParsiNOM';
import { P_UTILS } from '@lemons_dev/parsinom/lib/ParserUtils';
import { Parser } from '@lemons_dev/parsinom/lib/Parser';
import { ParsingRange } from '@lemons_dev/parsinom/lib/HelperTypes';
import { UnvalidatedFieldArgument } from '../inputFieldParser/InputFieldDeclaration';

export const ident = P.regexp(/^[a-z][a-z0-9_-]*/i)
	.map(x => {
		// console.log('ident', x);
		return x;
	})
	.describe('identifier');

export const identWithSpaces = P.sequenceMap(
	(a, b) => {
		return a + b.map(x => x[0] + x[1]).join('');
	},
	ident,
	P.sequence(P_UTILS.optionalWhitespace(), ident).many()
).describe('identifier with spaces');

export const escapeCharacter = P.string('\\')
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

function stringFactory(quotes: string): Parser<string> {
	return P.string(quotes)
		.then(
			P.or(escapeCharacter, P.noneOf(quotes + '\\'))
				.many()
				.map(x => x.join(''))
		)
		.skip(P.string(quotes));
}

export const singleQuotedString = stringFactory("'");
export const doubleQuotedString = stringFactory('"');

export interface ParsingResultNode {
	value: string;
	position?: ParsingRange;
}

export function createResultNode(value: string, range: ParsingRange): ParsingResultNode {
	return {
		value: value,
		position: range,
	};
}

export const nonStringArgumentValue: Parser<string> = P.regexp(/^[^()',]+/).describe('any character except parentheses, single quotation marks and commas');

export const argumentValue: Parser<ParsingResultNode> = P.or(singleQuotedString, nonStringArgumentValue).node(createResultNode);

export const argumentValues: Parser<ParsingResultNode[]> = P.separateBy(argumentValue, P.string(',').trim(P_UTILS.optionalWhitespace()));

export const fieldArgument: Parser<UnvalidatedFieldArgument> = P.sequenceMap(
	(name, value): UnvalidatedFieldArgument => {
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

export const fieldArguments: Parser<UnvalidatedFieldArgument[]> = P.separateBy(fieldArgument, P.string(',').trim(P_UTILS.optionalWhitespace()));

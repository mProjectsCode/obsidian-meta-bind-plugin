import { P } from '@lemons_dev/parsinom/lib/ParsiNOM';
import { Parser } from '@lemons_dev/parsinom/lib/Parser';
import { P_UTILS } from '@lemons_dev/parsinom/lib/ParserUtils';
import { UnvalidatedBindTargetDeclaration } from '../inputFieldParser/InputFieldDeclaration';
import { createResultNode, doubleQuotedString, ident, ParsingResultNode } from './GeneralParsers';

const filePath: Parser<string> = P.noneOf('{}[]#^|:?')
	.many()
	.map(x => x.join(''))
	.box('file path');

const metadataPathPartIdent: Parser<ParsingResultNode> = ident.node(createResultNode);

const bracketMetadataPathPart: Parser<ParsingResultNode> = P.or(P_UTILS.digits(), doubleQuotedString).wrap(P.string('['), P.string(']')).node(createResultNode);

const firstMetadataPathPart: Parser<UnvalidatedBindTargetDeclaration> = P.or(
	P.sequenceMap(
		(prefix, firstPart) => {
			return {
				file: undefined,
				boundToLocalScope: prefix !== undefined,
				path: firstPart,
			};
		},
		P.string('^').optional(),
		bracketMetadataPathPart.atLeast(1)
	),
	P.sequenceMap(
		(prefix, firstPart, bracketPath) => {
			return {
				file: undefined,
				boundToLocalScope: prefix !== undefined,
				path: [firstPart, ...bracketPath],
			};
		},
		P.string('^').optional(),
		metadataPathPartIdent,
		bracketMetadataPathPart.many()
	)
);

const metadataPathPart: Parser<ParsingResultNode[]> = P.sequenceMap(
	(ident, brackets) => {
		return [ident, ...brackets];
	},
	metadataPathPartIdent,
	bracketMetadataPathPart.many()
);

const metadataPath: Parser<UnvalidatedBindTargetDeclaration> = P.sequenceMap(
	(declaration, others) => {
		declaration.path = declaration.path.concat(others.flat());
		return declaration;
	},
	firstMetadataPathPart,
	P.string('.').then(metadataPathPart).many()
);

export const BIND_TARGET: Parser<UnvalidatedBindTargetDeclaration> = P.sequenceMap(
	(a, b) => {
		b.file = a?.[0];
		return b;
	},
	P.sequence(filePath.node(createResultNode), P.string('#')).optional(),
	metadataPath
);

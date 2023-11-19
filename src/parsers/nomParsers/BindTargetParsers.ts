import { P } from '@lemons_dev/parsinom/lib/ParsiNOM';
import { type Parser } from '@lemons_dev/parsinom/lib/Parser';
import { P_UTILS } from '@lemons_dev/parsinom/lib/ParserUtils';
import {
	type UnvalidatedBindTargetDeclaration,
	type UnvalidatedPropAccess,
} from '../inputFieldParser/InputFieldDeclaration';
import { createResultNode, doubleQuotedString, ident } from './GeneralParsers';
import { PROP_ACCESS_TYPE } from '../../utils/prop/PropAccess';

export const filePath: Parser<string> = P.manyNotOf('{}[]#^|:?').box('file path');

const metadataPathPartIdent: Parser<UnvalidatedPropAccess> = ident.node((node, range) => {
	return {
		type: PROP_ACCESS_TYPE.OBJECT,
		prop: createResultNode(node, range),
	};
});

const bracketMetadataPathPart: Parser<UnvalidatedPropAccess> = P.or(
	P_UTILS.digits()
		.wrap(P.string('['), P.string(']'))
		.node((node, range) => {
			return {
				type: PROP_ACCESS_TYPE.ARRAY,
				prop: createResultNode(node, range),
			};
		}),
	doubleQuotedString.wrap(P.string('['), P.string(']')).node((node, range) => {
		return {
			type: PROP_ACCESS_TYPE.OBJECT,
			prop: createResultNode(node, range),
		};
	}),
);

const firstMetadataPathPart: Parser<UnvalidatedBindTargetDeclaration> = P.or(
	P.sequenceMap(
		(prefix, firstPart) => {
			return {
				file: undefined,
				boundToLocalScope: prefix === '^',
				listenToChildren: false,
				path: firstPart,
			} satisfies UnvalidatedBindTargetDeclaration;
		},
		P.string('^').optional(),
		bracketMetadataPathPart.atLeast(1),
	),
	P.sequenceMap(
		(prefix, firstPart, bracketPath) => {
			return {
				file: undefined,
				boundToLocalScope: prefix === '^',
				listenToChildren: false,
				path: [firstPart, ...bracketPath],
			} satisfies UnvalidatedBindTargetDeclaration;
		},
		P.string('^').skip(P.string('.')).optional(),
		metadataPathPartIdent,
		bracketMetadataPathPart.many(),
	),
);

const metadataPathPart: Parser<UnvalidatedPropAccess[]> = P.sequenceMap(
	(ident, brackets) => {
		return [ident, ...brackets];
	},
	metadataPathPartIdent,
	bracketMetadataPathPart.many(),
);

const metadataPath: Parser<UnvalidatedBindTargetDeclaration> = P.sequenceMap(
	(declaration, others) => {
		declaration.path = declaration.path.concat(others.flat());
		return declaration;
	},
	firstMetadataPathPart,
	P.string('.').then(metadataPathPart).many(),
);

export const BIND_TARGET: Parser<UnvalidatedBindTargetDeclaration> = P.sequenceMap(
	(a, b) => {
		b.file = a?.[0];
		return b;
	},
	P.sequence(filePath.node(createResultNode), P.string('#')).optional(),
	metadataPath,
);

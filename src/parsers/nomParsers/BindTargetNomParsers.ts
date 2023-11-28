import { P } from '@lemons_dev/parsinom/lib/ParsiNOM';
import { type Parser } from '@lemons_dev/parsinom/lib/Parser';
import { P_UTILS } from '@lemons_dev/parsinom/lib/ParserUtils';
import { createResultNode, doubleQuotedString, ident } from './GeneralNomParsers';
import { PROP_ACCESS_TYPE } from '../../utils/prop/PropAccess';
import { type UnvalidatedBindTargetDeclaration, type UnvalidatedPropAccess } from '../BindTargetDeclaration';

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
	P.sequenceMap(firstPart => {
		return {
			storagePath: undefined,
			listenToChildren: false,
			storageProp: firstPart,
		} satisfies UnvalidatedBindTargetDeclaration;
	}, bracketMetadataPathPart.atLeast(1)),
	P.sequenceMap(
		(firstPart, bracketPath) => {
			return {
				storagePath: undefined,
				listenToChildren: false,
				storageProp: [firstPart, ...bracketPath],
			} satisfies UnvalidatedBindTargetDeclaration;
		},
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
		declaration.storageProp = declaration.storageProp.concat(others.flat());
		return declaration;
	},
	firstMetadataPathPart,
	P.string('.').then(metadataPathPart).many(),
);

export const BIND_TARGET: Parser<UnvalidatedBindTargetDeclaration> = P.sequenceMap(
	(a, b, c) => {
		c.storageType = a;
		c.storagePath = b;
		return c;
	},
	ident
		.describe('storage type')
		.node(createResultNode)
		.skip(P.string('^').describe('storage type separator "^"'))
		.optional(),
	filePath
		.describe('storage path')
		.node(createResultNode)
		.skip(P.string('#').describe('storage/file path separator "#"'))
		.optional(),
	metadataPath.describe('property path'),
).box('bind target');

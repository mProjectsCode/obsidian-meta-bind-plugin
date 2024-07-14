import type { Parser } from '@lemons_dev/parsinom/lib/Parser';
import { P_UTILS } from '@lemons_dev/parsinom/lib/ParserUtils';
import { P } from '@lemons_dev/parsinom/lib/ParsiNOM';
import type {
	UnvalidatedBindTargetDeclaration,
	UnvalidatedPropAccess,
} from 'packages/core/src/parsers/bindTargetParser/BindTargetDeclaration';
import {
	createResultNode,
	P_DoubleQuotedString,
	P_FilePath,
	P_Ident,
} from 'packages/core/src/parsers/nomParsers/GeneralNomParsers';
import { PropAccessType } from 'packages/core/src/utils/prop/PropAccess';

const P_MetadataPathPartIdent: Parser<UnvalidatedPropAccess> = P_Ident.node((node, range) => {
	return {
		type: PropAccessType.OBJECT,
		prop: createResultNode(node, range),
	};
});

const P_BracketMetadataPathPart: Parser<UnvalidatedPropAccess> = P.or(
	P_UTILS.digits()
		.wrap(P.string('['), P.string(']'))
		.node((node, range) => {
			return {
				type: PropAccessType.ARRAY,
				prop: createResultNode(node, range),
			};
		}),
	P_DoubleQuotedString.wrap(P.string('['), P.string(']')).node((node, range) => {
		return {
			type: PropAccessType.OBJECT,
			prop: createResultNode(node, range),
		};
	}),
);

const P_FirstMetadataPathPart: Parser<UnvalidatedBindTargetDeclaration> = P.or(
	P.sequenceMap(firstPart => {
		return {
			storagePath: undefined,
			listenToChildren: false,
			storageProp: firstPart,
		} satisfies UnvalidatedBindTargetDeclaration;
	}, P_BracketMetadataPathPart.atLeast(1)),
	P.sequenceMap(
		(firstPart, bracketPath) => {
			return {
				storagePath: undefined,
				listenToChildren: false,
				storageProp: [firstPart, ...bracketPath],
			} satisfies UnvalidatedBindTargetDeclaration;
		},
		P_MetadataPathPartIdent,
		P_BracketMetadataPathPart.many(),
	),
);

const P_MetadataPathPart: Parser<UnvalidatedPropAccess[]> = P.sequenceMap(
	(ident, brackets) => {
		return [ident, ...brackets];
	},
	P_MetadataPathPartIdent,
	P_BracketMetadataPathPart.many(),
);

export const P_MetadataPath: Parser<UnvalidatedBindTargetDeclaration> = P.sequenceMap(
	(declaration, others) => {
		declaration.storageProp = declaration.storageProp.concat(others.flat());
		return declaration;
	},
	P_FirstMetadataPathPart,
	P.string('.').then(P_MetadataPathPart).many(),
);

export const P_BindTarget: Parser<UnvalidatedBindTargetDeclaration> = P.sequenceMap(
	(a, b, c) => {
		c.storageType = a;
		c.storagePath = b;
		return c;
	},
	P_Ident.describe('storage type')
		.node(createResultNode)
		.skip(P.string('^').describe('storage type separator "^"'))
		.optional(),
	P_FilePath.describe('storage path')
		.node(createResultNode)
		.skip(P.string('#').describe('storage/file path separator "#"'))
		.optional(),
	P_MetadataPath.describe('property path'),
).box('bind target');

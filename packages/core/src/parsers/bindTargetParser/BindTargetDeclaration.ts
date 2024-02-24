import { type ParsingResultNode } from 'packages/core/src/parsers/nomParsers/GeneralNomParsers';
import { type PROP_ACCESS_TYPE } from 'packages/core/src/utils/prop/PropAccess';
import { type PropPath } from 'packages/core/src/utils/prop/PropPath';

export interface UnvalidatedBindTargetDeclaration {
	storageType?: ParsingResultNode | undefined;
	storagePath?: ParsingResultNode | undefined;
	storageProp: UnvalidatedPropAccess[];
	listenToChildren: boolean;
}

export interface UnvalidatedPropAccess {
	type: PROP_ACCESS_TYPE;
	prop: ParsingResultNode;
}

export interface BindTargetDeclaration {
	storageType: string;
	storagePath: string;
	storageProp: PropPath;
	listenToChildren: boolean;
}

export interface SimpleBindTargetDeclaration {
	storageType?: string | undefined;
	storagePath?: string | undefined;
	storageProp: SimplePropAccess[];
	listenToChildren: boolean;
}

export interface SimplePropAccess {
	type: PROP_ACCESS_TYPE;
	prop: string;
}

export enum BindTargetStorageType {
	FRONTMATTER = 'frontmatter',
	MEMORY = 'memory',
	GLOBAL_MEMORY = 'globalMemory',
	SCOPE = 'scope',
}

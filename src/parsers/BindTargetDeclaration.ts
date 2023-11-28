import { type PROP_ACCESS_TYPE } from '../utils/prop/PropAccess';
import { type ParsingResultNode } from './nomParsers/GeneralNomParsers';
import { type PropPath } from '../utils/prop/PropPath';

export interface UnvalidatedBindTargetDeclaration {
	storageType?: ParsingResultNode;
	storagePath?: ParsingResultNode;
	storageProp: UnvalidatedPropAccess[];
	listenToChildren: boolean;
}

export interface UnvalidatedPropAccess {
	type: PROP_ACCESS_TYPE;
	prop: ParsingResultNode;
}

export interface BindTargetDeclaration {
	storageType: BindTargetStorageType;
	storagePath: string;
	storageProp: PropPath;
	listenToChildren: boolean;
}

export enum BindTargetStorageType {
	FRONTMATTER = 'frontmatter',
	MEMORY = 'memory',
	GLOBAL_MEMORY = 'globalMemory',
	LOCAL = 'localScope',
}

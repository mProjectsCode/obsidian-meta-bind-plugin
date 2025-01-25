import type { ParsingResultNode } from 'packages/core/src/parsers/nomParsers/GeneralNomParsers';
import type { ErrorCollection } from 'packages/core/src/utils/errors/ErrorCollection';

export interface FieldDeclaration {
	declarationString?: string | undefined;
	errorCollection: ErrorCollection;
}

export interface SimpleFieldArgument {
	name: string;
	value: string[];
}

export interface UnvalidatedFieldArgument {
	name: ParsingResultNode;
	value: ParsingResultNode[];
}

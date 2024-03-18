import type { ErrorCollection } from 'packages/core/src/utils/errors/ErrorCollection';

export interface FieldDeclaration {
	declarationString?: string | undefined;
	errorCollection: ErrorCollection;
}

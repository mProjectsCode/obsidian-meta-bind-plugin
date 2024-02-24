import { type InputFieldType } from 'packages/core/src/config/FieldConfigs';
import { type InputFieldArgumentContainer } from 'packages/core/src/fields/fieldArguments/inputFieldArguments/InputFieldArgumentContainer';
import {
	type BindTargetDeclaration,
	type SimpleBindTargetDeclaration,
	type UnvalidatedBindTargetDeclaration,
} from 'packages/core/src/parsers/bindTargetParser/BindTargetDeclaration';
import { type ParsingResultNode } from 'packages/core/src/parsers/nomParsers/GeneralNomParsers';
import { type ErrorCollection } from 'packages/core/src/utils/errors/ErrorCollection';

export interface FieldDeclaration {
	declarationString?: string | undefined;
	errorCollection: ErrorCollection;
}

export interface InputFieldDeclaration extends FieldDeclaration {
	inputFieldType: InputFieldType;
	bindTarget: BindTargetDeclaration | undefined;
	argumentContainer: InputFieldArgumentContainer;
}

export interface UnvalidatedFieldArgument {
	name: ParsingResultNode;
	value: ParsingResultNode[];
}

export interface PartialUnvalidatedInputFieldDeclaration {
	inputFieldType?: ParsingResultNode | undefined;
	templateName?: ParsingResultNode | undefined;
	bindTarget?: UnvalidatedBindTargetDeclaration | undefined;
	arguments: UnvalidatedFieldArgument[];
}

export interface UnvalidatedInputFieldDeclaration extends PartialUnvalidatedInputFieldDeclaration, FieldDeclaration {}

export interface SimpleFieldArgument {
	name: string;
	value: string[];
}

export interface SimpleInputFieldDeclaration {
	inputFieldType?: InputFieldType | undefined;
	templateName?: string | undefined;
	bindTarget?: SimpleBindTargetDeclaration | undefined;
	arguments?: SimpleFieldArgument[] | undefined;
}

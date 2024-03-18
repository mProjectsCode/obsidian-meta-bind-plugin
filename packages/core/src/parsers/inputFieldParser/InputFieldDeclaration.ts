import { type InputFieldType } from 'packages/core/src/config/FieldConfigs';
import { type InputFieldArgumentContainer } from 'packages/core/src/fields/fieldArguments/inputFieldArguments/InputFieldArgumentContainer';
import {
	type BindTargetDeclaration,
	type SimpleBindTargetDeclaration,
	type UnvalidatedBindTargetDeclaration,
} from 'packages/core/src/parsers/bindTargetParser/BindTargetDeclaration';
import { type ParsingResultNode } from 'packages/core/src/parsers/nomParsers/GeneralNomParsers';
import { type FieldDeclaration } from 'packages/core/src/parsers/FieldDeclaration';
import {
	type SimpleFieldArgument,
	type UnvalidatedFieldArgument,
} from 'packages/core/src/parsers/nomParsers/FieldArgumentNomParsers';

export interface InputFieldDeclaration extends FieldDeclaration {
	inputFieldType: InputFieldType;
	bindTarget: BindTargetDeclaration | undefined;
	argumentContainer: InputFieldArgumentContainer;
}

export interface PartialUnvalidatedInputFieldDeclaration {
	inputFieldType?: ParsingResultNode | undefined;
	templateName?: ParsingResultNode | undefined;
	bindTarget?: UnvalidatedBindTargetDeclaration | undefined;
	arguments: UnvalidatedFieldArgument[];
}

export interface UnvalidatedInputFieldDeclaration extends PartialUnvalidatedInputFieldDeclaration, FieldDeclaration {}

export interface SimpleInputFieldDeclaration {
	inputFieldType?: InputFieldType | undefined;
	templateName?: string | undefined;
	bindTarget?: SimpleBindTargetDeclaration | undefined;
	arguments?: SimpleFieldArgument[] | undefined;
}

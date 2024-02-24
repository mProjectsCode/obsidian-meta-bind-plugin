import { type ViewFieldType } from 'packages/core/src/config/FieldConfigs';
import { type ViewFieldArgumentContainer } from 'packages/core/src/fields/fieldArguments/viewFieldArguments/ViewFieldArgumentContainer';
import {
	type BindTargetDeclaration,
	type SimpleBindTargetDeclaration,
	type UnvalidatedBindTargetDeclaration,
} from 'packages/core/src/parsers/bindTargetParser/BindTargetDeclaration';
import {
	type FieldDeclaration,
	type SimpleFieldArgument,
	type UnvalidatedFieldArgument,
} from 'packages/core/src/parsers/inputFieldParser/InputFieldDeclaration';
import { type ParsingResultNode } from 'packages/core/src/parsers/nomParsers/GeneralNomParsers';

export interface PartialUnvalidatedViewFieldDeclaration {
	/**
	 * Declaration array.
	 */
	templateDeclaration?: (string | UnvalidatedBindTargetDeclaration)[] | undefined;
	viewFieldType?: ParsingResultNode | undefined;
	arguments: UnvalidatedFieldArgument[];
	writeToBindTarget?: UnvalidatedBindTargetDeclaration | undefined;
}

export interface UnvalidatedViewFieldDeclaration extends PartialUnvalidatedViewFieldDeclaration, FieldDeclaration {}

export interface ViewFieldDeclaration extends FieldDeclaration {
	/**
	 * Declaration array.
	 */
	declarationArray: (string | BindTargetDeclaration)[];
	viewFieldType: ViewFieldType;
	argumentContainer: ViewFieldArgumentContainer;
	writeToBindTarget?: BindTargetDeclaration | undefined;
}

export interface SimpleViewFieldDeclaration {
	viewFieldType?: string | undefined;
	templateDeclaration?: (string | SimpleBindTargetDeclaration)[] | undefined;
	arguments?: SimpleFieldArgument[] | undefined;
	writeToBindTarget?: SimpleBindTargetDeclaration | undefined;
}

// ---
// JS View Field
// ---

export interface UnvalidatedJsViewFieldBindTargetMapping {
	bindTarget: UnvalidatedBindTargetDeclaration;
	name: string;
}

export interface PartialUnvalidatedJsViewFieldDeclaration {
	bindTargetMappings: UnvalidatedJsViewFieldBindTargetMapping[];
	writeToBindTarget?: UnvalidatedBindTargetDeclaration | undefined;
	code: string;
}

export interface UnvalidatedJsViewFieldDeclaration extends PartialUnvalidatedJsViewFieldDeclaration, FieldDeclaration {}

export interface JsViewFieldBindTargetMapping {
	bindTarget: BindTargetDeclaration;
	name: string;
}

export interface JsViewFieldDeclaration extends FieldDeclaration {
	bindTargetMappings: JsViewFieldBindTargetMapping[];
	writeToBindTarget?: BindTargetDeclaration | undefined;
	code: string;
}

export interface SimpleJsViewFieldBindTargetMapping {
	bindTarget: SimpleBindTargetDeclaration;
	name: string;
}

export interface SimpleJsViewFieldDeclaration {
	bindTargetMappings: SimpleJsViewFieldBindTargetMapping[];
	writeToBindTarget?: SimpleBindTargetDeclaration | undefined;
	code: string;
}

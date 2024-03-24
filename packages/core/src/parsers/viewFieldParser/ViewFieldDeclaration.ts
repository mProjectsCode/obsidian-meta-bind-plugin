import { type ViewFieldType } from 'packages/core/src/config/FieldConfigs';
import { type ViewFieldArgumentContainer } from 'packages/core/src/fields/fieldArguments/viewFieldArguments/ViewFieldArgumentContainer';
import {
	type BindTargetDeclaration,
	type UnvalidatedBindTargetDeclaration,
} from 'packages/core/src/parsers/bindTargetParser/BindTargetDeclaration';
import { type ParsingResultNode } from 'packages/core/src/parsers/nomParsers/GeneralNomParsers';
import { type FieldDeclaration } from 'packages/core/src/parsers/FieldDeclaration';
import {
	type SimpleFieldArgument,
	type UnvalidatedFieldArgument,
} from 'packages/core/src/parsers/nomParsers/FieldArgumentNomParsers';

export interface ViewFieldDeclaration extends FieldDeclaration {
	templateDeclaration: (string | BindTargetDeclaration)[];
	viewFieldType: ViewFieldType;
	argumentContainer: ViewFieldArgumentContainer;
	writeToBindTarget?: BindTargetDeclaration | undefined;
}

export interface UnvalidatedViewFieldDeclaration extends PartialUnvalidatedViewFieldDeclaration, FieldDeclaration {}

export interface PartialUnvalidatedViewFieldDeclaration {
	templateDeclaration?: (string | UnvalidatedBindTargetDeclaration)[] | undefined;
	viewFieldType?: ParsingResultNode | undefined;
	arguments: UnvalidatedFieldArgument[];
	writeToBindTarget?: UnvalidatedBindTargetDeclaration | undefined;
}

export interface SimpleViewFieldDeclaration {
	viewFieldType?: string | undefined;
	templateDeclaration?: (string | BindTargetDeclaration)[] | undefined;
	arguments?: SimpleFieldArgument[] | undefined;
	writeToBindTarget?: BindTargetDeclaration | undefined;
}

// ---
// JS View Field
// ---

export interface JsViewFieldDeclaration extends FieldDeclaration {
	bindTargetMappings: JsViewFieldBindTargetMapping[];
	writeToBindTarget?: BindTargetDeclaration | undefined;
	code: string;
}

export interface JsViewFieldBindTargetMapping {
	bindTarget: BindTargetDeclaration;
	name: string;
}

export interface UnvalidatedJsViewFieldDeclaration extends PartialUnvalidatedJsViewFieldDeclaration, FieldDeclaration {}

export interface PartialUnvalidatedJsViewFieldDeclaration {
	bindTargetMappings: UnvalidatedJsViewFieldBindTargetMapping[];
	writeToBindTarget?: UnvalidatedBindTargetDeclaration | undefined;
	code: string;
}

export interface UnvalidatedJsViewFieldBindTargetMapping {
	bindTarget: UnvalidatedBindTargetDeclaration;
	name: string;
}

export interface SimpleJsViewFieldDeclaration {
	bindTargetMappings: SimpleJsViewFieldBindTargetMapping[];
	writeToBindTarget?: BindTargetDeclaration | undefined;
	code: string;
}

export interface SimpleJsViewFieldBindTargetMapping {
	bindTarget: BindTargetDeclaration;
	name: string;
}

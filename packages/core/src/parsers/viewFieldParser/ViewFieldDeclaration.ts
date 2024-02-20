import { type UnvalidatedFieldArgument } from 'packages/core/src/parsers/inputFieldParser/InputFieldDeclaration';
import { type ErrorCollection } from 'packages/core/src/utils/errors/ErrorCollection';
import { type ParsingResultNode } from 'packages/core/src/parsers/nomParsers/GeneralNomParsers';
import { type ViewFieldArgumentContainer } from 'packages/core/src/fields/fieldArguments/viewFieldArguments/ViewFieldArgumentContainer';
import { type ViewFieldType } from 'packages/core/src/config/FieldConfigs';
import {
	type BindTargetDeclaration,
	type UnvalidatedBindTargetDeclaration,
} from 'packages/core/src/parsers/bindTargetParser/BindTargetDeclaration';

export interface PartialUnvalidatedViewFieldDeclaration {
	/**
	 * Declaration array.
	 */
	templateDeclaration?: (string | UnvalidatedBindTargetDeclaration)[];
	viewFieldType?: ParsingResultNode;
	arguments: UnvalidatedFieldArgument[];
	writeToBindTarget?: UnvalidatedBindTargetDeclaration;
}

export interface UnvalidatedViewFieldDeclaration extends PartialUnvalidatedViewFieldDeclaration {
	/**
	 * The full declaration of the view field including the "VIEW[]".
	 * e.g.
	 * VIEW[{x} * 2]
	 */
	fullDeclaration: string;

	errorCollection: ErrorCollection;
}

export interface ViewFieldDeclaration {
	/**
	 * The full declaration of the view field including the "VIEW[]".
	 * e.g.
	 * VIEW[{x} * 2]
	 */
	fullDeclaration: string;
	/**
	 * Declaration array.
	 */
	templateDeclaration: (string | BindTargetDeclaration)[];
	viewFieldType: ViewFieldType;
	argumentContainer: ViewFieldArgumentContainer;
	writeToBindTarget?: BindTargetDeclaration;

	errorCollection: ErrorCollection;
}

export interface UnvalidatedJsViewFieldBindTargetMapping {
	bindTarget: UnvalidatedBindTargetDeclaration;
	name: string;
}

export interface UnvalidatedJsViewFieldDeclaration {
	bindTargetMappings: UnvalidatedJsViewFieldBindTargetMapping[];
	writeToBindTarget: UnvalidatedBindTargetDeclaration | undefined;
	code: string;
}

export interface JsViewFieldBindTargetMapping {
	bindTarget: BindTargetDeclaration;
	name: string;
}

export interface JsViewFieldDeclaration {
	fullDeclaration: string;

	bindTargetMappings: JsViewFieldBindTargetMapping[];
	writeToBindTarget?: BindTargetDeclaration;
	code: string;

	errorCollection: ErrorCollection;
}

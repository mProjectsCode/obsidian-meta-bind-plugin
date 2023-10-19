import { BindTargetDeclaration, UnvalidatedBindTargetDeclaration, UnvalidatedFieldArgument } from '../inputFieldParser/InputFieldDeclaration';
import { ErrorCollection } from '../../utils/errors/ErrorCollection';
import { ViewFieldType } from './ViewFieldConfigs';
import { ParsingResultNode } from '../nomParsers/GeneralParsers';
import { ViewFieldArgumentContainer } from '../../fieldArguments/viewFieldArguments/ViewFieldArgumentContainer';

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
	code: string;
}

export interface JsViewFieldBindTargetMapping {
	bindTarget: BindTargetDeclaration;
	listenToChildren: boolean;
	name: string;
}

export interface JsViewFieldDeclaration {
	fullDeclaration: string;

	bindTargetMappings: JsViewFieldBindTargetMapping[];
	code: string;

	errorCollection: ErrorCollection;
}

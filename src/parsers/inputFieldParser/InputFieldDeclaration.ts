import { type InputFieldArgumentContainer } from '../../fields/fieldArguments/inputFieldArguments/InputFieldArgumentContainer';
import { type ErrorCollection } from '../../utils/errors/ErrorCollection';
import { type ParsingResultNode } from '../nomParsers/GeneralNomParsers';
import { type InputFieldType } from '../../config/FieldConfigs';
import { type PropPath } from '../../utils/prop/PropPath';
import { type PROP_ACCESS_TYPE } from '../../utils/prop/PropAccess';

export interface InputFieldDeclaration {
	/**
	 * The full declaration of the input field including the "INPUT[]".
	 * e.g.
	 * INPUT[input_type(argument_name(value)):bind_target]
	 */
	readonly fullDeclaration?: string;
	/**
	 * The type of the input field.
	 * e.g.
	 * input_type
	 */
	readonly inputFieldType: InputFieldType;
	/**
	 * Whether the input field is bound.
	 * e.g.
	 * true
	 */
	readonly isBound: boolean;
	/**
	 * The frontmatter field the input field is bound to.
	 * e.g.
	 * `bind_target` or `file#bind.target`
	 */
	readonly bindTarget?: BindTargetDeclaration;
	/**
	 * A collection of the input field arguments.
	 */
	readonly argumentContainer: InputFieldArgumentContainer;

	readonly errorCollection: ErrorCollection;
}

export interface UnvalidatedBindTargetDeclaration {
	file?: ParsingResultNode;
	boundToLocalScope: boolean;
	listenToChildren: boolean;
	path: UnvalidatedPropAccess[];
}

export interface UnvalidatedPropAccess {
	type: PROP_ACCESS_TYPE;
	prop: ParsingResultNode;
}

export interface BindTargetDeclaration {
	filePath: string | undefined;
	boundToLocalScope: boolean;
	listenToChildren: boolean;
	metadataPath: PropPath;
}

export interface FullBindTarget {
	filePath: string;
	boundToLocalScope: boolean;
	listenToChildren: boolean;
	metadataPath: PropPath;
}

export interface UnvalidatedFieldArgument {
	name: ParsingResultNode;
	value: ParsingResultNode[];
}

export interface PartialUnvalidatedInputFieldDeclaration {
	inputFieldType?: ParsingResultNode;
	templateName?: ParsingResultNode;
	bindTarget?: UnvalidatedBindTargetDeclaration;
	arguments: UnvalidatedFieldArgument[];
}

export interface UnvalidatedInputFieldDeclaration extends PartialUnvalidatedInputFieldDeclaration {
	fullDeclaration: string;
	errorCollection: ErrorCollection;
}

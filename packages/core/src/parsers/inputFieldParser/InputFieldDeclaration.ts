import { type InputFieldType } from 'packages/core/src/config/FieldConfigs';
import { type InputFieldArgumentContainer } from 'packages/core/src/fields/fieldArguments/inputFieldArguments/InputFieldArgumentContainer';
import {
	type BindTargetDeclaration,
	type UnvalidatedBindTargetDeclaration,
} from 'packages/core/src/parsers/bindTargetParser/BindTargetDeclaration';
import { type ParsingResultNode } from 'packages/core/src/parsers/nomParsers/GeneralNomParsers';
import { type ErrorCollection } from 'packages/core/src/utils/errors/ErrorCollection';

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

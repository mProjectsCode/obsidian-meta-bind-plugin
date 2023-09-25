import { InputFieldArgumentContainer } from '../../inputFieldArguments/InputFieldArgumentContainer';
import { ErrorCollection } from '../../utils/errors/ErrorCollection';
import { ParsingResultNode } from './InputFieldParser';
import { InputFieldType } from '../../inputFields/InputFieldConfigs';

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
	path: ParsingResultNode[];
}

export interface BindTargetDeclaration {
	filePath: string | undefined;
	metadataPath: string[];
}

export interface UnvalidatedInputFieldArgument {
	name: ParsingResultNode;
	value: ParsingResultNode[];
}

export interface PartialUnvalidatedInputFieldDeclaration {
	inputFieldType?: ParsingResultNode;
	templateName?: ParsingResultNode;
	bindTarget?: UnvalidatedBindTargetDeclaration;
	arguments: UnvalidatedInputFieldArgument[];
}

export interface UnvalidatedInputFieldDeclaration extends PartialUnvalidatedInputFieldDeclaration {
	fullDeclaration: string;
	errorCollection: ErrorCollection;
}
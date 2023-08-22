import { Abstract_PT_Node, ParsingTree, PT_Closure, PT_Literal } from './ParsingTree';
import {
	getClosureFromContext,
	getEntryFromContext,
	getLiteralFromContext,
	getSubContextArrayFromContext,
	hasContextEntry,
	ValidationContext,
	ValidationContextEntry,
	ValidationGraph,
} from './validationGraph/ValidationGraph';
import { InputFieldToken, InputFieldTokenType } from './InputFieldTokenizer';
import { ErrorCollection } from '../../utils/errors/ErrorCollection';
import { InputFieldType } from '../InputFieldDeclarationParser';
import { ParsingError } from './ParsingError';
import { ErrorLevel } from '../../utils/errors/MetaBindErrors';
import { UnvalidatedInputFieldDeclaration } from './InputFieldDeclarationValidator';
import { ITemplateSupplier } from './ITemplateSupplier';
import { InputFieldValidationGraphSupplier } from './validationGraph/InputFieldValidationGraphSupplier';
import { getTrimmedStructureParserResult, StructureParserResult } from './StructureParser';

export class InputFieldStructureParser {
	templateSupplier: ITemplateSupplier<UnvalidatedInputFieldDeclaration>;
	graphSupplier: InputFieldValidationGraphSupplier;

	fullDeclaration: string;
	tokens: InputFieldToken[];
	parsingTree: ParsingTree<InputFieldTokenType, InputFieldToken>;

	inputFieldType?: StructureParserResult<InputFieldTokenType, InputFieldToken>;
	bindTargetFile?: StructureParserResult<InputFieldTokenType, InputFieldToken>;
	bindTargetPath?: StructureParserResult<InputFieldTokenType, InputFieldToken>;
	arguments: {
		name: StructureParserResult<InputFieldTokenType, InputFieldToken>;
		value?: StructureParserResult<InputFieldTokenType, InputFieldToken>;
	}[];
	errorCollection: ErrorCollection;

	constructor(
		templateSupplier: ITemplateSupplier<UnvalidatedInputFieldDeclaration>,
		graphSupplier: InputFieldValidationGraphSupplier,
		fullDeclaration: string,
		tokens: InputFieldToken[],
		parsingTree: ParsingTree<InputFieldTokenType, InputFieldToken>,
		errorCollection: ErrorCollection
	) {
		this.templateSupplier = templateSupplier;
		this.graphSupplier = graphSupplier;
		this.fullDeclaration = fullDeclaration;
		this.tokens = tokens;
		this.parsingTree = parsingTree;
		this.errorCollection = errorCollection;

		this.inputFieldType = {
			result: InputFieldType.INVALID,
		};
		this.arguments = [];

		// Validation Graphs
	}

	private buildDeclaration(): UnvalidatedInputFieldDeclaration {
		return {
			fullDeclaration: this.fullDeclaration,
			inputFieldType: this.inputFieldType,
			bindTargetFile: this.bindTargetFile,
			bindTargetPath: this.bindTargetPath,
			arguments: this.arguments,
			errorCollection: this.errorCollection,
		};
	}

	public parseAsTemplate(): UnvalidatedInputFieldDeclaration {
		try {
			return this.parseFullDeclarationAsTemplate();
		} catch (e) {
			this.errorCollection.add(e);
			return this.buildDeclaration();
		}
	}

	private parseFullDeclarationAsTemplate(): UnvalidatedInputFieldDeclaration {
		const validationContext = this.validateNodeAndThrow(this.parsingTree, this.graphSupplier.templateFullDeclarationValidationGraph);

		this.parsePartialDeclaration(getClosureFromContext(validationContext, 'declaration').element);

		return this.buildDeclaration();
	}

	public parse(): UnvalidatedInputFieldDeclaration {
		try {
			return this.parseFullDeclaration();
		} catch (e) {
			this.errorCollection.add(e);
			return this.buildDeclaration();
		}
	}

	private parseFullDeclaration(): UnvalidatedInputFieldDeclaration {
		const validationContext = this.validateNodeAndThrow(this.parsingTree, this.graphSupplier.fullDeclarationValidationGraph);

		if (hasContextEntry(validationContext, 'template')) {
			this.parseTemplate(getClosureFromContext(validationContext, 'template').element);
			this.parsePartialDeclaration(getClosureFromContext(validationContext, 'declaration').element);
		} else {
			this.parseDeclaration(getClosureFromContext(validationContext, 'declaration').element);
		}

		return this.buildDeclaration();
	}

	private parseTemplate(closure: PT_Closure<InputFieldTokenType, InputFieldToken>): void {
		const validationContext = this.validateNodeAndThrow(closure, this.graphSupplier.templateNameValidationGraph);

		if (hasContextEntry(validationContext, 'templateName')) {
			const templateNameLiteral = getEntryFromContext(validationContext, 'templateName').element;
			const templateName = templateNameLiteral.getToken().literal.trim();

			if (templateName !== '') {
				const template = this.templateSupplier.getTemplate(templateName);

				if (template !== undefined) {
					this.inputFieldType = template.inputFieldType;
					this.bindTargetFile = template.bindTargetFile;
					this.bindTargetPath = template.bindTargetPath;
					this.arguments = template.arguments;

					this.errorCollection.merge(template.errorCollection);
				} else {
					this.errorCollection.add(
						new ParsingError(
							ErrorLevel.WARNING,
							'failed to apply template',
							`template with name ${templateName} not found`,
							{},
							closure.str,
							templateNameLiteral.getToken(),
							'input field parser'
						)
					);
				}
			}
		}
	}

	private parsePartialDeclaration(closure: PT_Closure<InputFieldTokenType, InputFieldToken>): void {
		const validationContext = this.validateNodeAndThrow(closure, this.graphSupplier.partialDeclarationValidationGraph);

		if (hasContextEntry(validationContext, 'type')) {
			this.inputFieldType = this.parseInputFieldType(getLiteralFromContext(validationContext, 'type'));
		}

		if (hasContextEntry(validationContext, 'arguments')) {
			this.parseArguments(getClosureFromContext(validationContext, 'arguments'));
		}

		if (hasContextEntry(validationContext, 'bindTargetSeparator')) {
			this.parseBindTarget(closure, validationContext, getLiteralFromContext(validationContext, 'bindTargetSeparator'));
		}
	}

	private parseDeclaration(closure: PT_Closure<InputFieldTokenType, InputFieldToken>): void {
		const validationContext = this.validateNodeAndThrow(closure, this.graphSupplier.declarationValidationGraph);

		this.inputFieldType = this.parseInputFieldType(getLiteralFromContext(validationContext, 'type'));

		if (hasContextEntry(validationContext, 'arguments')) {
			this.parseArguments(getClosureFromContext(validationContext, 'arguments'));
		}

		if (hasContextEntry(validationContext, 'bindTargetSeparator')) {
			this.parseBindTarget(closure, validationContext, getLiteralFromContext(validationContext, 'bindTargetSeparator'));
		}
	}

	/**
	 * Parses the bind target from a closure from a specific index.
	 * The index should be the suspected position of the bind target separator.
	 *
	 * @param closure
	 * @param validationContext
	 * @param bindTargetSeparatorContextEntry
	 * @private
	 */
	private parseBindTarget(
		closure: PT_Closure<InputFieldTokenType, InputFieldToken>,
		validationContext: ValidationContext<InputFieldTokenType, InputFieldToken, string>,
		bindTargetSeparatorContextEntry: ValidationContextEntry<InputFieldTokenType, InputFieldToken, PT_Literal<InputFieldTokenType, InputFieldToken>>
	): void {
		const separatorIndex = bindTargetSeparatorContextEntry.inputIndex;
		if (closure.children[separatorIndex] === undefined) {
			// there is no bind target
			return;
		}

		const bindTargetContextEntry = getLiteralFromContext(validationContext, 'bindTarget');
		const bindTargetFileContextEntry = getLiteralFromContext(validationContext, 'bindTargetFile');

		// parsing the bind target with this parser sucks
		let bindTargetLiteral = '';
		for (let i = bindTargetContextEntry.inputIndex; i < closure.children.length; i++) {
			bindTargetLiteral += closure.children[i].toLiteral();
		}

		this.bindTargetFile = getTrimmedStructureParserResult(bindTargetFileContextEntry);
		this.bindTargetPath = {
			result: bindTargetLiteral,
			ptElement: bindTargetContextEntry.element,
		};
	}

	private parseArguments(contextEntry: ValidationContextEntry<InputFieldTokenType, InputFieldToken, PT_Closure<InputFieldTokenType, InputFieldToken>>): void {
		const closure = contextEntry.element;
		if (closure.children.length === 0) {
			return;
		}

		const validationContext = this.validateNodeAndThrow(closure, this.graphSupplier.argumentsValidationGraph);

		const subContextArray = getSubContextArrayFromContext(validationContext, 'arguments');

		for (const x of subContextArray) {
			const typeContextEntry: ValidationContextEntry<
				InputFieldTokenType,
				InputFieldToken,
				PT_Literal<InputFieldTokenType, InputFieldToken>
			> = getLiteralFromContext(x, 'name');
			const valueContextEntry:
				| ValidationContextEntry<InputFieldTokenType, InputFieldToken, PT_Closure<InputFieldTokenType, InputFieldToken>>
				| undefined = getClosureFromContext(x, 'value');

			this.arguments.push(this.parseArgument(typeContextEntry, valueContextEntry));
		}
	}

	private parseArgument(
		nameContextEntry: ValidationContextEntry<InputFieldTokenType, InputFieldToken, PT_Literal<InputFieldTokenType, InputFieldToken>>,
		valueContextEntry: ValidationContextEntry<InputFieldTokenType, InputFieldToken, PT_Closure<InputFieldTokenType, InputFieldToken>> | undefined
	): { name: StructureParserResult<InputFieldTokenType, InputFieldToken>; value?: StructureParserResult<InputFieldTokenType, InputFieldToken> } {
		if (valueContextEntry?.element) {
			let valueString = '';
			for (const child of valueContextEntry.element.children) {
				valueString += child.toLiteral();
			}

			return {
				name: getTrimmedStructureParserResult(nameContextEntry),
				value: {
					result: valueString,
					ptElement: valueContextEntry.element,
				},
			};
		} else {
			return {
				name: getTrimmedStructureParserResult(nameContextEntry),
			};
		}
	}

	private validateNodeAndThrow<Key extends string>(
		astNode: Abstract_PT_Node<InputFieldTokenType, InputFieldToken>,
		validationGraph: ValidationGraph<InputFieldTokenType, InputFieldToken, Key>
	): ValidationContext<InputFieldTokenType, InputFieldToken, Key> {
		const valRes = validationGraph.validateParsingTreeAndExtractContext(astNode);

		if (valRes.acceptedState === undefined) {
			throw valRes.validationError;
		}

		return valRes.acceptedState.context;
	}

	private parseInputFieldType(
		contextEntry: ValidationContextEntry<InputFieldTokenType, InputFieldToken, PT_Literal<InputFieldTokenType, InputFieldToken>>
	): StructureParserResult<InputFieldTokenType, InputFieldToken> {
		return getTrimmedStructureParserResult(contextEntry);
	}
}

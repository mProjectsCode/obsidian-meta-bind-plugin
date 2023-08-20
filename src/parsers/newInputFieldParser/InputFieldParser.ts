import { ErrorLevel, MetaBindParsingError, MetaBindValidationError } from '../../utils/errors/MetaBindErrors';
import { InputFieldArgumentType, InputFieldDeclaration, InputFieldType } from '../InputFieldDeclarationParser';
import { InputFieldArgumentContainer } from '../../inputFieldArguments/InputFieldArgumentContainer';
import { ErrorCollection } from '../../utils/errors/ErrorCollection';
import { IPlugin } from '../../IPlugin';
import { AbstractInputFieldArgument } from '../../inputFieldArguments/AbstractInputFieldArgument';
import { InputFieldArgumentFactory } from '../../inputFieldArguments/InputFieldArgumentFactory';
import {
	getEntryFromContext,
	getSubContextArrayFromContext,
	hasContextEntry,
	ValidationContext,
	ValidationContextEntry,
	ValidationGraph,
} from './validationGraph/ValidationGraph';
import { ComplexTreeLayout, TL_C_Enumeration, TL_C_Literal, TL_C_Loop, TL_C_Optional, TL_C_Or } from './validationGraph/treeLayout/ComplexTreeLayout';
import { ParsingError } from './ParsingError';
import { InputFieldParsingTreeParser } from './InputFieldParsingTreeParser';
import { Abstract_PT_Node, ParsingTree, PT_Closure, PT_Element, PT_Element_Type, PT_Literal } from './ParsingTree';
import { InputFieldToken, InputFieldTokenizer, InputFieldTokenType } from './InputFieldTokenizer';
import { InputFieldTemplate } from '../../settings/Settings';
import { deepFreeze } from '../../utils/Utils';

export interface UnvalidatedInputFieldDeclaration {
	fullDeclaration: string;
	inputFieldType?: StructureParserResult;
	bindTargetFile?: StructureParserResult;
	bindTargetPath?: StructureParserResult;
	arguments: {
		name: StructureParserResult;
		value?: StructureParserResult;
	}[];

	errorCollection: ErrorCollection;
}

export interface StructureParserResult {
	result: string;
	ptElement?: PT_Element;
}

export function getTrimmedStructureParserResult<T extends PT_Element>(validationContextEntry: ValidationContextEntry<T>): StructureParserResult;
export function getTrimmedStructureParserResult<T extends PT_Element>(validationContextEntry: undefined): undefined;
export function getTrimmedStructureParserResult<T extends PT_Element>(
	validationContextEntry: ValidationContextEntry<T> | undefined
): StructureParserResult | undefined {
	if (!validationContextEntry) {
		return undefined;
	}
	return {
		result: validationContextEntry.element.toLiteral().trim(),
		ptElement: validationContextEntry.element,
	};
}

export class StructureParser {
	inputFieldParser: NewInputFieldDeclarationParser;

	fullDeclaration: string;
	tokens: InputFieldToken[];
	parsingTree: ParsingTree;

	inputFieldType?: StructureParserResult;
	bindTargetFile?: StructureParserResult;
	bindTargetPath?: StructureParserResult;
	arguments: {
		name: StructureParserResult;
		value?: StructureParserResult;
	}[];
	errorCollection: ErrorCollection;

	fullDeclarationValidationGraph: ValidationGraph;
	declarationValidationGraph: ValidationGraph;
	partialDeclarationValidationGraph: ValidationGraph;
	templateValidationGraph: ValidationGraph;
	fullDeclarationTemplateValidationGraph: ValidationGraph;

	constructor(
		inputFieldParser: NewInputFieldDeclarationParser,
		fullDeclaration: string,
		tokens: InputFieldToken[],
		parsingTree: ParsingTree,
		errorCollection: ErrorCollection
	) {
		this.inputFieldParser = inputFieldParser;
		this.fullDeclaration = fullDeclaration;
		this.tokens = tokens;
		this.parsingTree = parsingTree;
		this.errorCollection = errorCollection;

		this.inputFieldType = {
			result: InputFieldType.INVALID,
		};
		this.arguments = [];

		// Validation Graphs

		// literal.closure or literal.closure.closure
		this.fullDeclarationValidationGraph = new ValidationGraph([
			new TL_C_Literal(PT_Element_Type.LITERAL, InputFieldTokenType.WORD, 'INPUT'),
			new TL_C_Optional([new TL_C_Literal(PT_Element_Type.CLOSURE, InputFieldTokenType.L_SQUARE, undefined, 'template')]),
			new TL_C_Literal(PT_Element_Type.CLOSURE, InputFieldTokenType.L_SQUARE, undefined, 'declaration'),
		]);
		this.fullDeclarationValidationGraph.optimize();

		this.fullDeclarationTemplateValidationGraph = new ValidationGraph([
			new TL_C_Literal(PT_Element_Type.LITERAL, InputFieldTokenType.WORD, 'INPUT'),
			new TL_C_Literal(PT_Element_Type.CLOSURE, InputFieldTokenType.L_SQUARE, undefined, 'declaration'),
		]);
		this.fullDeclarationTemplateValidationGraph.optimize();

		const inputFieldType_TL_C_Element: TL_C_Literal = new TL_C_Literal(PT_Element_Type.LITERAL, InputFieldTokenType.WORD, undefined, 'type');
		const arguments_TL_C_Element: TL_C_Literal = new TL_C_Literal(PT_Element_Type.CLOSURE, InputFieldTokenType.L_PAREN, undefined, 'arguments');
		const bindTarget_TL_C_Elements: ComplexTreeLayout = [
			new TL_C_Literal(PT_Element_Type.LITERAL, InputFieldTokenType.COLON, undefined, 'bindTargetSeparator'), // bind target separator
			new TL_C_Optional([
				new TL_C_Literal(PT_Element_Type.LITERAL, InputFieldTokenType.WORD, undefined, 'bindTargetFile'), // file
				new TL_C_Literal(PT_Element_Type.LITERAL, InputFieldTokenType.HASHTAG), // hashtag
			]), // optional file and hashtag
			new TL_C_Literal(PT_Element_Type.LITERAL, InputFieldTokenType.WORD, undefined, 'bindTarget'), // first bind target metadata path part
			new TL_C_Loop(
				[
					new TL_C_Or([
						[new TL_C_Literal(PT_Element_Type.LITERAL, InputFieldTokenType.WORD)],
						[new TL_C_Literal(PT_Element_Type.CLOSURE, InputFieldTokenType.L_SQUARE)],
					]), // either literal or closure or none, in a loop
				],
				0,
				-1
			), // the other bind target metadata path part
		];

		this.declarationValidationGraph = new ValidationGraph([
			inputFieldType_TL_C_Element,
			new TL_C_Optional([arguments_TL_C_Element]), // optional arguments
			new TL_C_Optional(bindTarget_TL_C_Elements),
		]);
		this.declarationValidationGraph.optimize();

		this.partialDeclarationValidationGraph = new ValidationGraph([
			new TL_C_Optional([inputFieldType_TL_C_Element]), // input field type
			new TL_C_Optional([arguments_TL_C_Element]), // optional arguments
			new TL_C_Optional(bindTarget_TL_C_Elements),
		]);
		this.partialDeclarationValidationGraph.optimize();

		this.templateValidationGraph = new ValidationGraph([
			new TL_C_Optional([new TL_C_Literal(PT_Element_Type.LITERAL, InputFieldTokenType.WORD, undefined, 'templateName')]),
		]);
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
		const validationContext = this.validateNodeAndThrow(this.parsingTree, this.fullDeclarationTemplateValidationGraph);

		this.parsePartialDeclaration(getEntryFromContext<PT_Closure>(validationContext, 'declaration').element);

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
		const validationContext = this.validateNodeAndThrow(this.parsingTree, this.fullDeclarationValidationGraph);

		if (hasContextEntry(validationContext, 'template')) {
			this.parseTemplate(getEntryFromContext<PT_Closure>(validationContext, 'template').element);
			this.parsePartialDeclaration(getEntryFromContext<PT_Closure>(validationContext, 'declaration').element);
		} else {
			this.parseDeclaration(getEntryFromContext<PT_Closure>(validationContext, 'declaration').element);
		}

		return this.buildDeclaration();
	}

	private parseTemplate(closure: PT_Closure): void {
		const validationContext = this.validateNodeAndThrow(closure, this.templateValidationGraph);

		if (hasContextEntry(validationContext, 'templateName')) {
			const templateNameLiteral = getEntryFromContext<PT_Literal>(validationContext, 'templateName').element;
			const templateName = templateNameLiteral.getToken().literal.trim();

			if (templateName !== '') {
				const template = this.inputFieldParser.getTemplate(templateName);

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

	private parsePartialDeclaration(closure: PT_Closure): void {
		const validationContext = this.validateNodeAndThrow(closure, this.partialDeclarationValidationGraph);

		if (hasContextEntry(validationContext, 'type')) {
			this.inputFieldType = this.parseInputFieldType(getEntryFromContext<PT_Literal>(validationContext, 'type'));
		}

		if (hasContextEntry(validationContext, 'arguments')) {
			this.parseArguments(getEntryFromContext<PT_Closure>(validationContext, 'arguments'));
		}

		if (hasContextEntry(validationContext, 'bindTargetSeparator')) {
			this.parseBindTarget(closure, validationContext, getEntryFromContext<PT_Literal>(validationContext, 'bindTargetSeparator'));
		}
	}

	private parseDeclaration(closure: PT_Closure): void {
		const validationContext = this.validateNodeAndThrow(closure, this.declarationValidationGraph);

		this.inputFieldType = this.parseInputFieldType(getEntryFromContext<PT_Literal>(validationContext, 'type'));

		if (hasContextEntry(validationContext, 'arguments')) {
			this.parseArguments(getEntryFromContext<PT_Closure>(validationContext, 'arguments'));
		}

		if (hasContextEntry(validationContext, 'bindTargetSeparator')) {
			this.parseBindTarget(closure, validationContext, getEntryFromContext<PT_Literal>(validationContext, 'bindTargetSeparator'));
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
		closure: PT_Closure,
		validationContext: ValidationContext,
		bindTargetSeparatorContextEntry: ValidationContextEntry<PT_Literal>
	): void {
		const separatorIndex = bindTargetSeparatorContextEntry.inputIndex;
		if (closure.children[separatorIndex] === undefined) {
			// there is no bind target
			return;
		}

		const bindTargetContextEntry = getEntryFromContext<PT_Literal>(validationContext, 'bindTarget');
		const bindTargetFileContextEntry = getEntryFromContext<PT_Literal>(validationContext, 'bindTargetFile');

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

	private parseArguments(contextEntry: ValidationContextEntry<PT_Closure>): void {
		const closure = contextEntry.element;
		if (closure.children.length === 0) {
			return;
		}

		// TODO: move this validation graph
		const layoutValidationGraph = new ValidationGraph([
			new TL_C_Enumeration(
				[
					new TL_C_Literal(PT_Element_Type.LITERAL, InputFieldTokenType.WORD, undefined, 'name'),
					new TL_C_Optional([new TL_C_Literal(PT_Element_Type.CLOSURE, InputFieldTokenType.L_PAREN, undefined, 'value')]),
				],
				[new TL_C_Literal(PT_Element_Type.LITERAL, InputFieldTokenType.COMMA)],
				'arguments'
			),
		]);
		layoutValidationGraph.optimize();

		const validationContext = this.validateNodeAndThrow(closure, layoutValidationGraph);

		const subContextArray = getSubContextArrayFromContext(validationContext, 'arguments');

		for (const x of subContextArray) {
			const typeContextEntry: ValidationContextEntry<PT_Literal> = getEntryFromContext<PT_Literal>(x, 'name');
			const valueContextEntry: ValidationContextEntry<PT_Closure> | undefined = getEntryFromContext<PT_Closure>(x, 'value');

			this.arguments.push(this.parseArgument(typeContextEntry, valueContextEntry));
		}
	}

	private parseArgument(
		nameContextEntry: ValidationContextEntry<PT_Literal>,
		valueContextEntry: ValidationContextEntry<PT_Closure> | undefined
	): { name: StructureParserResult; value?: StructureParserResult } {
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

	private validateNodeAndThrow(astNode: Abstract_PT_Node, validationGraph: ValidationGraph): ValidationContext {
		const valRes = validationGraph.validateParsingTreeAndExtractContext(astNode);

		if (valRes.acceptedState === undefined) {
			throw valRes.validationError;
		}

		return valRes.acceptedState.context;
	}

	private parseInputFieldType(contextEntry: ValidationContextEntry<PT_Literal>): StructureParserResult {
		return getTrimmedStructureParserResult(contextEntry);
	}
}

export class InputFieldDeclarationValidator {
	unvalidatedDeclaration: UnvalidatedInputFieldDeclaration;
	errorCollection: ErrorCollection;

	constructor(unvalidatedDeclaration: UnvalidatedInputFieldDeclaration) {
		this.unvalidatedDeclaration = unvalidatedDeclaration;

		this.errorCollection = new ErrorCollection('input field declaration');
	}

	public validate(): InputFieldDeclaration {
		const inputFieldType = this.validateInputFieldType();
		const bindTarget = this.validateBindTarget();
		// TODO: remove this and pass the object directly into the declaration
		const bindTargetString = bindTarget.file ? bindTarget.file + '#' + bindTarget.path : bindTarget.path;
		const argumentContainer = this.validateArguments(inputFieldType);

		console.log('bind target', this.unvalidatedDeclaration.fullDeclaration, bindTarget, bindTargetString);

		return {
			fullDeclaration: this.unvalidatedDeclaration.fullDeclaration,
			inputFieldType: inputFieldType,
			isBound: bindTargetString !== '',
			bindTarget: bindTargetString,
			argumentContainer: argumentContainer,
			errorCollection: this.errorCollection.merge(this.unvalidatedDeclaration.errorCollection),
		};
	}

	private validateInputFieldType(): InputFieldType {
		const inputFieldType = this.unvalidatedDeclaration.inputFieldType;

		for (const entry of Object.entries(InputFieldType)) {
			if (entry[1] === inputFieldType?.result) {
				return entry[1];
			}
		}

		if (inputFieldType?.ptElement) {
			this.errorCollection.add(
				new ParsingError(
					ErrorLevel.ERROR,
					'failed to parse',
					`Encountered invalid token. Expected token to be an input field type but received '${inputFieldType}'.`,
					{},
					inputFieldType.ptElement.str,
					inputFieldType.ptElement.getToken(),
					'Declaration Validator'
				)
			);
		} else {
			this.errorCollection.add(
				new MetaBindValidationError(
					ErrorLevel.ERROR,
					'failed to parse',
					`Encountered invalid token. Expected token to be an input field type but received '${inputFieldType}'.`,
					{}
				)
			);
		}

		return InputFieldType.INVALID;
	}

	private validateBindTarget(): { file: string; path: string } {
		return {
			file: this.unvalidatedDeclaration.bindTargetFile?.result ?? '',
			path: this.unvalidatedDeclaration.bindTargetPath?.result ?? '',
		};
	}

	private validateArguments(inputFieldType: InputFieldType): InputFieldArgumentContainer {
		const argumentContainer = new InputFieldArgumentContainer();

		for (const argument of this.unvalidatedDeclaration.arguments) {
			const argumentType = this.validateArgumentType(argument.name);
			if (argumentType === InputFieldArgumentType.INVALID) {
				continue;
			}

			const inputFieldArgument: AbstractInputFieldArgument = InputFieldArgumentFactory.createInputFieldArgument(argumentType);

			if (!inputFieldArgument.isAllowed(inputFieldType)) {
				this.errorCollection.add(
					new MetaBindParsingError(
						ErrorLevel.WARNING,
						'failed to parse input field arguments',
						`argument "${argument.name.result}" is only applicable to "${inputFieldArgument.getAllowedInputFieldsAsString()}" input fields`
					)
				);
				continue;
			}

			if (inputFieldArgument.requiresValue) {
				if (!argument.value) {
					if (argument.name.ptElement) {
						this.errorCollection.add(
							new ParsingError(
								ErrorLevel.WARNING,
								'failed to parse input field arguments',
								`argument "${argument.name.result}" requires a non empty value`,
								{},
								argument.name.ptElement.str,
								argument.name.ptElement.getToken(),
								'Declaration Validator'
							)
						);
					} else {
						this.errorCollection.add(
							new MetaBindValidationError(
								ErrorLevel.WARNING,
								'failed to parse input field arguments',
								`argument "${argument.name.result}" requires a non empty value`
							)
						);
					}

					continue;
				}

				try {
					inputFieldArgument.parseValue(argument.value.result);
				} catch (e) {
					this.errorCollection.add(e);
					// TODO: better error message/handling
					continue;
				}
			}

			argumentContainer.add(inputFieldArgument);
		}

		try {
			argumentContainer.validate();
		} catch (e) {
			this.errorCollection.add(e);
		}

		return argumentContainer;
	}

	private validateArgumentType(argumentType: StructureParserResult): InputFieldArgumentType {
		for (const entry of Object.entries(InputFieldArgumentType)) {
			if (entry[1] === argumentType.result) {
				return entry[1];
			}
		}

		if (argumentType.ptElement) {
			this.errorCollection.add(
				new ParsingError(
					ErrorLevel.WARNING,
					'failed to parse',
					`Encountered invalid token. Expected token to be an input field argument type but received '${argumentType.result}'.`,
					{},
					argumentType.ptElement.str,
					argumentType.ptElement.getToken(),
					'Declaration Validator'
				)
			);
		} else {
			this.errorCollection.add(
				new MetaBindValidationError(
					ErrorLevel.WARNING,
					'failed to parse',
					`Encountered invalid token. Expected token to be an input field argument type but received '${argumentType.result}'.`,
					{}
				)
			);
		}

		return InputFieldArgumentType.INVALID;
	}
}

export interface InputFieldDeclarationTemplate {
	readonly name: string;
	readonly template: Readonly<UnvalidatedInputFieldDeclaration>;
}

export class NewInputFieldDeclarationParser {
	plugin: IPlugin;
	templates: InputFieldDeclarationTemplate[];

	constructor(plugin: IPlugin) {
		this.plugin = plugin;
		this.templates = [];
	}

	public parseString(fullDeclaration: string): InputFieldDeclaration {
		const errorCollection = new ErrorCollection('InputFieldParser');

		try {
			const tokenizer = new InputFieldTokenizer(fullDeclaration);
			const tokens = tokenizer.getTokens();
			const parsingTreeParser = new InputFieldParsingTreeParser(fullDeclaration, tokens);
			const parsingTree = parsingTreeParser.parse();
			const structureParser = new StructureParser(this, fullDeclaration, tokens, parsingTree, errorCollection);
			const unvalidatedDeclaration = structureParser.parse();
			const declarationValidator = new InputFieldDeclarationValidator(unvalidatedDeclaration);

			return declarationValidator.validate();
		} catch (e) {
			errorCollection.add(e);
		}

		return {
			fullDeclaration: fullDeclaration,
			inputFieldType: InputFieldType.INVALID,
			isBound: false,
			bindTarget: '',
			argumentContainer: new InputFieldArgumentContainer(),
			errorCollection: errorCollection,
		};
	}

	public parseStringWithoutValidation(fullDeclaration: string): UnvalidatedInputFieldDeclaration {
		const errorCollection = new ErrorCollection('InputFieldParser');

		try {
			const tokenizer = new InputFieldTokenizer(fullDeclaration);
			const tokens = tokenizer.getTokens();
			const parsingTreeParser = new InputFieldParsingTreeParser(fullDeclaration, tokens);
			const parsingTree = parsingTreeParser.parse();
			const structureParser = new StructureParser(this, fullDeclaration, tokens, parsingTree, errorCollection);

			return structureParser.parse();
		} catch (e) {
			errorCollection.add(e);
		}

		return {
			fullDeclaration: fullDeclaration,
			inputFieldType: { result: InputFieldType.INVALID },
			bindTargetFile: undefined,
			bindTargetPath: undefined,
			arguments: [],
			errorCollection: errorCollection,
		};
	}

	public validateDeclaration(unvalidatedDeclaration: UnvalidatedInputFieldDeclaration): InputFieldDeclaration {
		const declarationValidator = new InputFieldDeclarationValidator(unvalidatedDeclaration);

		return declarationValidator.validate();
	}

	private parseTemplateString(template: string): UnvalidatedInputFieldDeclaration {
		const errorCollection = new ErrorCollection('InputFieldParser');

		try {
			const tokenizer = new InputFieldTokenizer(template);
			const tokens = tokenizer.getTokens();
			const parsingTreeParser = new InputFieldParsingTreeParser(template, tokens);
			const parsingTree = parsingTreeParser.parse();
			const structureParser = new StructureParser(this, template, tokens, parsingTree, errorCollection);

			return structureParser.parseAsTemplate();
		} catch (e) {
			errorCollection.add(e);
		}

		return {
			fullDeclaration: template,
			inputFieldType: { result: InputFieldType.INVALID },
			bindTargetFile: undefined,
			bindTargetPath: undefined,
			arguments: [],
			errorCollection: errorCollection,
		};
	}

	public parseTemplates(templates: InputFieldTemplate[]): ErrorCollection {
		this.templates = [];
		const errorCollection: ErrorCollection = new ErrorCollection('input field template parser');

		for (const template of templates) {
			const templateDeclaration = this.parseTemplateString(template.declaration);

			errorCollection.merge(templateDeclaration.errorCollection);

			const temp: InputFieldDeclarationTemplate = {
				name: template.name,
				template: templateDeclaration,
			};

			this.templates.push(deepFreeze(temp));
		}

		return errorCollection;
	}

	public getTemplate(templateName: string): Readonly<UnvalidatedInputFieldDeclaration> | undefined {
		return this.templates.find(x => x.name === templateName)?.template;
	}
}

import { ErrorLevel, MetaBindParsingError } from '../../utils/errors/MetaBindErrors';
import { InputFieldArgumentType, InputFieldDeclaration, InputFieldType } from '../InputFieldDeclarationParser';
import { BindTargetDeclaration } from '../BindTargetParser';
import { InputFieldArgumentContainer } from '../../inputFieldArguments/InputFieldArgumentContainer';
import { ErrorCollection } from '../../utils/errors/ErrorCollection';
import { IPlugin } from '../../IPlugin';
import { AbstractInputFieldArgument } from '../../inputFieldArguments/AbstractInputFieldArgument';
import { InputFieldArgumentFactory } from '../../inputFieldArguments/InputFieldArgumentFactory';
import { isTruthy } from '../../utils/Utils';
import { getEntryFromContext, getSubContextArrayFromContext, hasContextEntry, ValidationContext, ValidationGraph } from './validationGraph/ValidationGraph';
import { TL_C_Enumeration, TL_C_Literal, TL_C_Loop, TL_C_Optional, TL_C_Or } from './validationGraph/treeLayout/ComplexTreeLayout';
import { ParsingError } from './ParsingError';
import { InputFieldParsingTreeParser } from './InputFieldParsingTreeParser';
import { Abstract_PT_Node, ParsingTree, PT_Closure, PT_Element_Type, PT_Literal } from './ParsingTree';
import { InputFieldToken, InputFieldTokenizer, InputFieldTokenType } from './InputFieldTokenizer';

export class DeclarationParser {
	plugin: IPlugin;
	filePath: string;

	fullDeclaration: string;
	tokens: InputFieldToken[];
	parsingTree: ParsingTree;

	type: InputFieldType;
	bindTarget: BindTargetDeclaration | undefined;
	bindTargetString: string | undefined;
	argumentContainer: InputFieldArgumentContainer;
	errorCollection: ErrorCollection;

	constructor(
		plugin: IPlugin,
		filePath: string,
		fullDeclaration: string,
		tokens: InputFieldToken[],
		parsingTree: ParsingTree,
		errorCollection: ErrorCollection
	) {
		this.plugin = plugin;
		this.filePath = filePath;
		this.fullDeclaration = fullDeclaration;
		this.tokens = tokens;
		this.parsingTree = parsingTree;
		this.errorCollection = errorCollection;

		this.type = InputFieldType.INVALID;
		this.argumentContainer = new InputFieldArgumentContainer();
	}

	public parse(): InputFieldDeclaration {
		try {
			return this.parseDeclaration();
		} catch (e) {
			this.errorCollection.add(e);
			return this.buildDeclaration();
		}
	}

	private parseDeclaration(): InputFieldDeclaration {
		// literal.closure or literal.closure.closure
		const layoutValidationGraph = new ValidationGraph([
			new TL_C_Literal(PT_Element_Type.LITERAL, InputFieldTokenType.WORD, 'INPUT'),
			new TL_C_Optional([new TL_C_Literal(PT_Element_Type.CLOSURE, InputFieldTokenType.L_SQUARE, undefined, 'template')]),
			new TL_C_Literal(PT_Element_Type.CLOSURE, InputFieldTokenType.L_SQUARE, undefined, 'declaration'),
		]);
		const validationContext = this.validateNodeAndThrow(this.parsingTree, layoutValidationGraph);

		console.log(validationContext);

		if (hasContextEntry(validationContext, 'template')) {
			this.parseTemplate(getEntryFromContext<PT_Closure>(validationContext, 'template').element);
		}
		this.parsePureDeclaration(getEntryFromContext<PT_Closure>(validationContext, 'declaration').element);

		return this.buildDeclaration();
	}

	private buildDeclaration(): InputFieldDeclaration {
		return {
			fullDeclaration: this.fullDeclaration,
			inputFieldType: this.type,
			isBound: isTruthy(this.bindTargetString),
			bindTarget: this.bindTargetString ?? '',
			argumentContainer: this.argumentContainer,
			errorCollection: this.errorCollection,
		};
	}

	private parseTemplate(closure: PT_Closure): void {
		// TODO
	}

	private parsePureDeclaration(closure: PT_Closure): void {
		const layoutValidationGraph = new ValidationGraph([
			new TL_C_Literal(PT_Element_Type.LITERAL, InputFieldTokenType.WORD, undefined, 'type'), // input field type
			new TL_C_Optional([new TL_C_Literal(PT_Element_Type.CLOSURE, InputFieldTokenType.L_PAREN, undefined, 'arguments')]), // optional arguments
			new TL_C_Optional([
				new TL_C_Literal(PT_Element_Type.LITERAL, InputFieldTokenType.COLON, undefined, 'bindTargetSeparator'), // bind target separator
				new TL_C_Optional([
					new TL_C_Literal(PT_Element_Type.LITERAL, InputFieldTokenType.WORD, undefined, 'bindTargetFile'), // file
					new TL_C_Literal(PT_Element_Type.LITERAL, InputFieldTokenType.HASHTAG), // hashtag
				]), // optional file and hashtag
				new TL_C_Literal(PT_Element_Type.LITERAL, InputFieldTokenType.WORD, undefined, 'bindTarget'), // first bind target metadata path part
				new TL_C_Loop(
					[
						new TL_C_Or([[new TL_C_Literal(PT_Element_Type.LITERAL)], [new TL_C_Literal(PT_Element_Type.CLOSURE)]]), // either literal or closure or none, in a loop
					],
					0,
					-1
				), // the other bind target metadata path part
			]),
		]);

		layoutValidationGraph.optimizeParsingGraph();

		const validationContext = this.validateNodeAndThrow(closure, layoutValidationGraph);

		console.log(validationContext);

		this.type = this.parseInputFieldType(getEntryFromContext<PT_Literal>(validationContext, 'type').element);

		if (hasContextEntry(validationContext, 'arguments')) {
			this.parseArguments(getEntryFromContext<PT_Closure>(validationContext, 'arguments').element);
		}

		if (hasContextEntry(validationContext, 'bindTargetSeparator')) {
			this.parseBindTarget(closure, getEntryFromContext<PT_Literal>(validationContext, 'bindTargetSeparator').inputIndex);
		}
	}

	/**
	 * Parses the bind target from a closure from a specific index.
	 * The index should be the suspected position of the bind target separator.
	 *
	 * @param closure
	 * @param index
	 * @private
	 */
	private parseBindTarget(closure: PT_Closure, index: number): void {
		if (closure.children[index] === undefined) {
			// there is no bind target
			return;
		}

		// separator
		closure.getChild(index, InputFieldTokenType.COLON);

		// parsing the bind target with this parser sucks
		let bindTargetLiteral = '';
		for (let i = index + 1; i < closure.children.length; i++) {
			bindTargetLiteral += closure.children[i].toLiteral();
		}

		this.bindTargetString = bindTargetLiteral;
	}

	private parseArguments(closure: PT_Closure): void {
		if (closure.children.length === 0) {
			return;
		}

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

		layoutValidationGraph.optimizeParsingGraph();

		const validationContext = this.validateNodeAndThrow(closure, layoutValidationGraph);

		const inputFieldArguments: { type: InputFieldArgumentType; value: string }[] = getSubContextArrayFromContext(validationContext, 'arguments').map(x => {
			const typeLiteral: PT_Literal = getEntryFromContext<PT_Literal>(x, 'name').element;
			const valueClosure: PT_Closure | undefined = getEntryFromContext<PT_Closure>(x, 'value')?.element;

			return this.parseArgument(typeLiteral, valueClosure);
		});

		this.parseArgumentsIntoContainer(inputFieldArguments);
	}

	private parseArgument(argumentNameLiteral: PT_Literal, argumentValueClosure: PT_Closure | undefined): { type: InputFieldArgumentType; value: string } {
		let valueString = '';
		if (argumentValueClosure) {
			for (const child of argumentValueClosure.children) {
				valueString += child.toLiteral();
			}
		}

		return {
			type: this.parseInputFieldArgumentType(argumentNameLiteral),
			value: valueString,
		};
	}

	private parseArgumentsIntoContainer(inputFieldArguments: { type: InputFieldArgumentType; value: string }[] | undefined): void {
		if (inputFieldArguments) {
			for (const argument of inputFieldArguments) {
				const inputFieldArgument: AbstractInputFieldArgument = InputFieldArgumentFactory.createInputFieldArgument(argument.type);

				if (!inputFieldArgument.isAllowed(this.type)) {
					this.errorCollection.add(
						new MetaBindParsingError(
							ErrorLevel.WARNING,
							'failed to parse input field arguments',
							`argument "${argument.type}" is only applicable to "${inputFieldArgument.getAllowedInputFieldsAsString()}" input fields`
						)
					);
					continue;
				}

				if (inputFieldArgument.requiresValue) {
					if (!argument.value) {
						this.errorCollection.add(
							new MetaBindParsingError(
								ErrorLevel.WARNING,
								'failed to parse input field arguments',
								`argument "${argument.type}" requires a non empty value`
							)
						);
						continue;
					}
					try {
						inputFieldArgument.parseValue(argument.value);
					} catch (e) {
						this.errorCollection.add(e);
						continue;
					}
				}

				this.argumentContainer.add(inputFieldArgument);
			}

			try {
				this.argumentContainer.validate();
			} catch (e) {
				this.errorCollection.add(e);
			}
		}
	}

	private validateNodeAndThrow(astNode: Abstract_PT_Node, validationGraph: ValidationGraph): ValidationContext {
		const valRes = validationGraph.validateParsingTreeAndExtractContext(astNode);

		if (valRes.acceptedState === undefined) {
			const layout = validationGraph.layout;
			console.log(astNode, validationGraph, valRes);

			throw new ParsingError(
				ErrorLevel.ERROR,
				'failed to parse',
				`Encountered invalid token. Expected token types to be of order ${layout} but received ${astNode.children.map(x => x.type)}.`,
				{},
				astNode.str,
				astNode.getToken(),
				'AST Parser'
			);
		}

		return valRes.acceptedState.context;
	}

	private parseInputFieldType(astLiteral: PT_Literal): InputFieldType {
		for (const entry of Object.entries(InputFieldType)) {
			if (entry[1] === astLiteral.toLiteral().trim()) {
				return entry[1];
			}
		}

		throw new ParsingError(
			ErrorLevel.ERROR,
			'failed to parse',
			`Encountered invalid token. Expected token to be an input field type but received '${astLiteral.toLiteral()}'.`,
			{},
			astLiteral.str,
			astLiteral.getToken(),
			'AST Parser'
		);
	}

	private parseInputFieldArgumentType(astLiteral: PT_Literal): InputFieldArgumentType {
		for (const entry of Object.entries(InputFieldArgumentType)) {
			if (entry[1] === astLiteral.toLiteral().trim()) {
				return entry[1];
			}
		}

		throw new ParsingError(
			ErrorLevel.ERROR,
			'failed to parse',
			`Encountered invalid token. Expected token to be an input field argument type but received '${astLiteral.toLiteral()}'.`,
			{},
			astLiteral.str,
			astLiteral.getToken(),
			'AST Parser'
		);
	}
}

export class NewInputFieldDeclarationParser {
	plugin: IPlugin;

	constructor(plugin: IPlugin) {
		this.plugin = plugin;
	}

	public parseString(fullDeclaration: string, filePath: string): InputFieldDeclaration {
		const errorCollection = new ErrorCollection('InputFieldParser');

		try {
			const tokenizer = new InputFieldTokenizer(fullDeclaration);
			const tokens = tokenizer.getTokens();
			const parsingTreeParser = new InputFieldParsingTreeParser(fullDeclaration, tokens);
			const parsingTree = parsingTreeParser.parse();
			const declarationParser = new DeclarationParser(this.plugin, filePath, fullDeclaration, tokens, parsingTree, errorCollection);

			return declarationParser.parse();
		} catch (e) {
			errorCollection.add(e);
		}

		return {
			fullDeclaration: fullDeclaration,
			declaration: undefined,
			inputFieldType: InputFieldType.INVALID,
			isBound: false,
			bindTarget: '',
			argumentContainer: new InputFieldArgumentContainer(),
			errorCollection: errorCollection,
		};
	}
}

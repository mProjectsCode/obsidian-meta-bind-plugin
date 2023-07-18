import { ErrorLevel, ErrorType, MetaBindError, MetaBindParsingError } from '../../utils/errors/MetaBindErrors';
import { InputFieldArgumentType, InputFieldDeclaration, InputFieldType } from '../InputFieldDeclarationParser';
import { BindTargetDeclaration } from '../BindTargetParser';
import { InputFieldArgumentContainer } from '../../inputFieldArguments/InputFieldArgumentContainer';
import { ErrorCollection } from '../../utils/errors/ErrorCollection';
import { TreeLayoutLoop, TreeLayoutOr, ValidationGraph } from './TreeValidator';
import { IPlugin } from '../../IPlugin';
import { AbstractInputFieldArgument } from '../../inputFieldArguments/AbstractInputFieldArgument';
import { InputFieldArgumentFactory } from '../../inputFieldArguments/InputFieldArgumentFactory';
import { isTruthy } from '../../utils/Utils';

export class ParsingError extends MetaBindError {
	str: string;
	token: AbstractToken<string> | undefined;
	source: string;

	constructor(
		errorLevel: ErrorLevel,
		effect: string,
		cause: string | Error,
		context: Record<string, any>,
		str: string,
		token: AbstractToken<string> | undefined,
		source: string
	) {
		super(errorLevel, effect, cause, context);

		this.str = str;
		this.token = token;
		this.source = source;

		this.updateMessage2();
	}

	public getErrorType(): ErrorType {
		return ErrorType.PARSING;
	}

	protected updateMessage2(): void {
		if (this.cause instanceof Error) {
			this.message = `[${this.getErrorType()}] "${this.effect}" caused by error "${this.cause.message}"\n`;
		} else {
			this.message = `[${this.getErrorType()}] "${this.effect}" caused by "${this.cause}"\n`;
		}

		if (this.token) {
			this.message += this.str + '\n';
			this.message += ' '.repeat(this.token.range.from) + '^'.repeat(this.token.range.to - this.token.range.from + 1) + '\n';
		}
	}
}

export interface AbstractToken<TokenType extends string> {
	type: TokenType;
	literal: string;
	range: Range;
}

export interface Closure<TokenType extends string> {
	openingTokenType: TokenType;
	closingTokenType: TokenType;
}

export enum InputFieldTokenType {
	ILLEGAL = 'ILLEGAL',
	EOF = 'EOF',
	WORD = 'WORD',
	L_PAREN = '(',
	R_PAREN = ')',
	L_SQUARE = '[',
	R_SQUARE = ']',
	COLON = ':',
	HASHTAG = '#',
	DOT = '.',
	COMMA = ',',
	QUOTE = "'",
}

const InputFieldClosures: Closure<InputFieldTokenType>[] = [
	{
		openingTokenType: InputFieldTokenType.L_PAREN,
		closingTokenType: InputFieldTokenType.R_PAREN,
	},
	{
		openingTokenType: InputFieldTokenType.L_SQUARE,
		closingTokenType: InputFieldTokenType.R_SQUARE,
	},
];

export interface Range {
	from: number;
	to: number;
}

export interface InputFieldToken extends AbstractToken<InputFieldTokenType> {}

function createToken(type: InputFieldTokenType, literal: string, from: number, to: number): InputFieldToken {
	return {
		type: type,
		literal: literal,
		range: {
			from: from,
			to: to,
		},
	};
}

export class InputFieldTokenizer {
	private readonly input: string;
	private readonly tokens: InputFieldToken[];
	private currentToken: InputFieldToken | undefined;
	private inQuotes: boolean;
	private position: number;
	private readPosition: number;
	private ch!: string;

	constructor(input: string) {
		this.input = input;

		this.tokens = [];
		this.currentToken = undefined;
		this.inQuotes = false;
		this.position = 0;
		this.readPosition = 0;

		this.readChar();
	}

	public getTokens(): InputFieldToken[] {
		while (this.currentToken?.type !== InputFieldTokenType.EOF) {
			this.readNextToken();
		}

		return this.tokens;
	}

	private readNextToken(): void {
		let token: InputFieldToken | undefined;

		if (this.inQuotes) {
			if (this.ch === "'") {
				this.inQuotes = false;
			} else if (this.currentToken && this.currentToken.type === InputFieldTokenType.WORD) {
				this.currentToken.literal += this.ch;
				this.currentToken.range.to = this.position;
			} else {
				token = this.createToken(InputFieldTokenType.WORD);
			}
		} else {
			if (this.ch === '(') {
				token = this.createToken(InputFieldTokenType.L_PAREN);
			} else if (this.ch === ')') {
				token = this.createToken(InputFieldTokenType.R_PAREN);
			} else if (this.ch === '[') {
				token = this.createToken(InputFieldTokenType.L_SQUARE);
			} else if (this.ch === ']') {
				token = this.createToken(InputFieldTokenType.R_SQUARE);
			} else if (this.ch === ':') {
				token = this.createToken(InputFieldTokenType.COLON);
			} else if (this.ch === '#') {
				token = this.createToken(InputFieldTokenType.HASHTAG);
			} else if (this.ch === '.') {
				token = this.createToken(InputFieldTokenType.DOT);
			} else if (this.ch === ',') {
				token = this.createToken(InputFieldTokenType.COMMA);
			} else if (this.ch === "'") {
				this.inQuotes = true;
			} else if (this.ch === '\0') {
				token = this.createToken(InputFieldTokenType.EOF, 'eof');
			} else {
				if (this.currentToken && this.currentToken.type === InputFieldTokenType.WORD) {
					this.currentToken.literal += this.ch;
					this.currentToken.range.to = this.position;
				} else {
					token = this.createToken(InputFieldTokenType.WORD);
				}
			}
		}

		if (token) {
			this.currentToken = token;
			this.tokens.push(token);
		}

		this.readChar();
	}

	private readChar(): void {
		this.ch = this.peek();

		this.position = this.readPosition;
		this.readPosition += 1;
	}

	private peek(): string {
		if (this.readPosition >= this.input.length) {
			return '\0';
		} else {
			return this.input[this.readPosition];
		}
	}

	private createToken(type: InputFieldTokenType, char?: string): InputFieldToken {
		return createToken(type, char !== undefined ? char : this.ch, this.position, this.position);
	}
}

export enum AST_El_Type {
	LITERAL = 'LITERAL',
	CLOSURE = 'CLOSURE',
	ROOT = 'ROOT',
	SPECIAL_START = 'SPECIAL_START',
	SPECIAL_END = 'SPECIAL_END',

	NONE = 'NONE',
}

export abstract class Abstract_AST_El {
	type: AST_El_Type;
	str: string;

	protected constructor(type: AST_El_Type, str: string) {
		this.type = type;
		this.str = str;
	}

	abstract getToken(): InputFieldToken | undefined;

	abstract toLiteral(): string;

	abstract toDebugString(): string;
}

export abstract class Abstract_AST_Node extends Abstract_AST_El {
	children: AST_El[];

	protected constructor(type: AST_El_Type, str: string, children: AST_El[]) {
		super(type, str);
		this.children = children;
	}

	getChild(index: number, expected?: InputFieldTokenType | undefined): AST_El {
		const el = this.children[index];
		if (!el) {
			throw new Error('This parser sucks');
		}

		if (expected && el.getToken().type !== expected) {
			throw new ParsingError(
				ErrorLevel.ERROR,
				'failed to parse',
				`Encountered invalid token. Expected token to be of type '${expected}' but received '${el.getToken().type}'.`,
				{},
				this.str,
				el.getToken(),
				'AST Parser'
			);
		}

		return el;
	}

	public toLiteral(): string {
		return this.children.map(x => x.toLiteral()).join('');
	}
}

export class AST_Literal extends Abstract_AST_El {
	token: InputFieldToken;

	constructor(token: InputFieldToken, str: string) {
		super(AST_El_Type.LITERAL, str);

		this.token = token;
	}

	public getToken(): InputFieldToken {
		return this.token;
	}

	public checkContent(expected: string, trim: boolean = false): void {
		const content = trim ? this.token.literal.trim() : this.token.literal;
		if (content !== expected) {
			throw new ParsingError(
				ErrorLevel.ERROR,
				'failed to parse',
				`Encountered invalid token content. Expected token content to equal '${expected}' but received ${this.token.literal}.`,
				{},
				this.str,
				this.token,
				'AST Parser'
			);
		}
	}

	public toLiteral(): string {
		return this.token.literal;
	}

	toDebugString(): string {
		return this.token.literal;
	}
}

export class AST_Closure extends Abstract_AST_Node {
	startLiteral: AST_Literal;
	endLiteral: AST_Literal;

	constructor(str: string, startLiteral: AST_Literal, endLiteral: AST_Literal, children: AST_El[]) {
		super(AST_El_Type.CLOSURE, str, children);

		this.startLiteral = startLiteral;
		this.endLiteral = endLiteral;
	}

	public getRange(): Range {
		return {
			from: this.startLiteral.token.range.from,
			to: this.startLiteral.token.range.to,
		};
	}

	public getToken(): InputFieldToken {
		return this.startLiteral.token;
	}

	public toLiteral(): string {
		return this.startLiteral.token.literal + this.children.map(x => x.toLiteral()).join('') + this.endLiteral.token.literal;
	}

	toDebugString(): string {
		return `${this.startLiteral.token.literal}\n${this.children
			.map(x => x.toDebugString())
			.join('\n')
			.split('\n')
			.map(x => '    ' + x)
			.join('\n')}\n${this.startLiteral.token.literal}`;
	}
}

export type AST_El = AST_Literal | AST_Closure;

export class AST_Root extends Abstract_AST_Node {
	tokens: InputFieldToken[];

	constructor(str: string, tokens: InputFieldToken[]) {
		super(AST_El_Type.ROOT, str, []);

		this.tokens = tokens;
	}

	public getToken(): InputFieldToken | undefined {
		return undefined;
	}

	toDebugString(): string {
		return `root\n${this.children
			.map(x => x.toDebugString())
			.join('\n')
			.split('\n')
			.map(x => '    ' + x)
			.join('\n')}`;
	}
}

export class InputFieldASTParser {
	private readonly tokens: InputFieldToken[];
	private readonly closureStack: Closure<InputFieldTokenType>[];
	private readonly astRoot: AST_Root;
	private position: number;

	constructor(str: string, tokens: InputFieldToken[]) {
		this.tokens = tokens;
		this.position = 0;
		this.closureStack = [];
		this.astRoot = new AST_Root(str, tokens);
	}

	public parse(): AST_Root {
		while (this.getCurrentToken().type !== InputFieldTokenType.EOF) {
			const astel = this.parseCurrentToken();
			this.astRoot.children.push(astel);

			if (this.position >= this.tokens.length) {
				throw new Error('index to big');
			}
		}

		return this.astRoot;
	}

	private parseCurrentToken(): AST_El {
		const token = this.getCurrentToken();

		this.throwOnInvalidToken();

		const astelLiteral = new AST_Literal(token, this.astRoot.str);

		for (const closure of InputFieldClosures) {
			const astelClosure = this.parseClosure(astelLiteral, closure);
			if (astelClosure) {
				return astelClosure;
			}
		}

		// move the position to the next token
		this.position += 1;

		return astelLiteral;
	}

	private parseClosure(openingLiteral: AST_Literal, closure: Closure<InputFieldTokenType>): AST_El | undefined {
		if (openingLiteral.token.type !== closure.openingTokenType) {
			return undefined;
		}

		this.closureStack.push(closure);

		let closingLiteral: AST_Literal | undefined;
		const children: AST_El[] = [];

		// skip the opening token
		this.position += 1;

		while (this.getCurrentToken().type !== InputFieldTokenType.EOF) {
			const nestedRes = this.parseCurrentToken();

			if (nestedRes.type === AST_El_Type.LITERAL && (nestedRes as AST_Literal).token.type === closure.closingTokenType) {
				closingLiteral = nestedRes as AST_Literal;
				break;
			} else {
				children.push(nestedRes);
			}
		}

		if (!closingLiteral) {
			// ERROR
			throw new ParsingError(ErrorLevel.ERROR, 'failed to parse', 'closure was not closed', {}, this.astRoot.str, openingLiteral.token, 'AST Parser');
		}

		this.closureStack.pop();

		return new AST_Closure(this.astRoot.str, openingLiteral, closingLiteral, children);
	}

	private getCurrentToken(): InputFieldToken {
		return this.tokens[this.position];
	}

	throwOnInvalidToken(): void {
		const token = this.getCurrentToken();

		// check for closure closing tokens that do not actually close a closure
		const currentClosure = this.closureStack.length > 0 ? this.closureStack[this.closureStack.length - 1] : undefined;

		for (const closure of InputFieldClosures) {
			// if the closure is the current token
			if (currentClosure && closure.openingTokenType === currentClosure.openingTokenType && closure.closingTokenType === currentClosure.closingTokenType) {
				continue;
			}

			// if the current token is a closing token of a closure that is not the active closure
			if (token.type === closure.closingTokenType) {
				throw new ParsingError(
					ErrorLevel.ERROR,
					'failed to parse',
					'Encountered invalid token. Active closure is not the closure that this token closes.',
					{},
					this.astRoot.str,
					token,
					'AST Parser'
				);
			}
		}
	}
}

export interface InputFieldParsingData {
	fullDeclaration: string;
	tokens: InputFieldToken[];
	ast: AST_Root;
}

// export interface InputFieldDeclaration {
// 	parsingData: InputFieldParsingData | undefined;
// 	type: InputFieldType;
// 	bindTarget: BindTargetDeclaration | undefined;
// 	argumentContainer: InputFieldArgumentContainer;
// 	errorCollection: ErrorCollection;
// }

function splitAST_Els(list: AST_El[], tokenType: InputFieldTokenType): AST_El[][] {
	const out: AST_El[][] = [];
	let current: AST_El[] = [];

	for (const listElement of list) {
		if (listElement.getToken().type === tokenType) {
			out.push(current);
			current = [];
		} else {
			current.push(listElement);
		}
	}

	out.push(current);

	return out;
}

export class DeclarationParser {
	plugin: IPlugin;
	filePath: string;

	fullDeclaration: string;
	tokens: InputFieldToken[];
	ast: AST_Root;

	type: InputFieldType;
	bindTarget: BindTargetDeclaration | undefined;
	bindTargetString: string | undefined;
	argumentContainer: InputFieldArgumentContainer;
	errorCollection: ErrorCollection;

	constructor(plugin: IPlugin, filePath: string, fullDeclaration: string, tokens: InputFieldToken[], ast: AST_Root, errorCollection: ErrorCollection) {
		this.plugin = plugin;
		this.filePath = filePath;
		this.fullDeclaration = fullDeclaration;
		this.tokens = tokens;
		this.ast = ast;
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
		const layoutValidationGraph = new ValidationGraph([AST_El_Type.LITERAL, new TreeLayoutLoop([AST_El_Type.CLOSURE], 1, 2)]);
		this.validateNodeAndThrow(this.ast, layoutValidationGraph);

		const inputLiteral = this.ast.getChild(0, InputFieldTokenType.WORD) as AST_Literal;
		inputLiteral.checkContent('INPUT', false);

		if (this.ast.children.length === 2) {
			const pureDeclarationClosure = this.ast.getChild(1, InputFieldTokenType.L_SQUARE) as AST_Closure;
			this.parsePureDeclaration(pureDeclarationClosure);
		} else if (this.ast.children.length === 3) {
			const templateClosure = this.ast.getChild(1, InputFieldTokenType.L_SQUARE) as AST_Closure;
			this.parseTemplate(templateClosure);

			const pureDeclarationClosure = this.ast.getChild(2, InputFieldTokenType.L_SQUARE) as AST_Closure;
			this.parsePureDeclaration(pureDeclarationClosure);
		} else {
			throw new Error('this parser sucks');
		}

		// first literal should contain 'INPUT'

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

	private parseTemplate(closure: AST_Closure): void {
		// TODO
	}

	private parsePureDeclaration(closure: AST_Closure): void {
		const layoutValidationGraph = new ValidationGraph([
			AST_El_Type.LITERAL, // input field type
			new TreeLayoutOr([], [AST_El_Type.CLOSURE]), // optional arguments
			new TreeLayoutOr(
				[],
				[
					AST_El_Type.LITERAL, // bind target separator
					new TreeLayoutOr(
						[AST_El_Type.LITERAL, AST_El_Type.LITERAL], // file and hashtag
						[] // no file
					),
					AST_El_Type.LITERAL, // first bind target metadata path part
					new TreeLayoutLoop([new TreeLayoutLoop([AST_El_Type.LITERAL], 0, -1), new TreeLayoutLoop([AST_El_Type.CLOSURE], 0, -1)], 0, -1), // the other bind target metadata path part
				]
			),
		]);
		this.validateNodeAndThrow(closure, layoutValidationGraph);

		const inputFieldTypeLiteral = closure.getChild(0, InputFieldTokenType.WORD) as AST_Literal;
		this.type = this.parseInputFieldType(inputFieldTypeLiteral);

		const tempAST_El = closure.children[1];

		if (tempAST_El === undefined) {
			return;
		} else if (tempAST_El instanceof AST_Closure) {
			// argument closure
			const argumentClosure = closure.getChild(1, InputFieldTokenType.L_PAREN) as AST_Closure;
			this.parseArguments(argumentClosure);

			// bind target start
			const temp2AST_El = closure.children[2];
			if (temp2AST_El !== undefined) {
				this.parseBindTarget(closure, 2);
			}
		} else {
			// bind target starts
			this.parseBindTarget(closure, 1);
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
	private parseBindTarget(closure: AST_Closure, index: number): void {
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

		// const bindTargetParser = new BindTargetParser(this.plugin);
		// this.bindTarget = bindTargetParser.parseBindTarget(bindTargetLiteral, this.filePath);
	}

	private parseArguments(closure: AST_Closure): void {
		if (closure.children.length === 0) {
			return;
		}

		const inputFieldArguments: { type: InputFieldArgumentType; value: string }[] = [];

		const temp = splitAST_Els(closure.children, InputFieldTokenType.COMMA);

		for (const tempElement of temp) {
			if (tempElement.length === 0) {
				throw new ParsingError(
					ErrorLevel.ERROR,
					'failed to parse',
					`Encountered invalid token. Expected token to be of type '${InputFieldTokenType.WORD}' but received nothing. Check for double commas in the input field arguments.`,
					{},
					closure.str,
					undefined,
					'AST Parser'
				);
			} else if (tempElement.length === 1) {
				const argumentNameLiteral = tempElement[0] as AST_Literal;
				if (argumentNameLiteral.getToken().type !== InputFieldTokenType.WORD) {
					throw new ParsingError(
						ErrorLevel.ERROR,
						'failed to parse',
						`Encountered invalid token. Expected token to be of type '${InputFieldTokenType.WORD}' but received '${argumentNameLiteral.getToken().type}'.`,
						{},
						argumentNameLiteral.str,
						argumentNameLiteral.getToken(),
						'AST Parser'
					);
				}
				inputFieldArguments.push(this.parseArgument(argumentNameLiteral, undefined));
			} else if (tempElement.length === 2) {
				const argumentNameLiteral = tempElement[0] as AST_Literal;
				if (argumentNameLiteral.getToken().type !== InputFieldTokenType.WORD) {
					throw new ParsingError(
						ErrorLevel.ERROR,
						'failed to parse',
						`Encountered invalid token. Expected token to be of type '${InputFieldTokenType.WORD}' but received '${argumentNameLiteral.getToken().type}'.`,
						{},
						argumentNameLiteral.str,
						argumentNameLiteral.getToken(),
						'AST Parser'
					);
				}

				const argumentValueClosure = tempElement[1] as AST_Closure;
				if (argumentValueClosure.getToken().type !== InputFieldTokenType.L_PAREN) {
					throw new ParsingError(
						ErrorLevel.ERROR,
						'failed to parse',
						`Encountered invalid token. Expected token to be of type '${InputFieldTokenType.L_PAREN}' but received '${argumentValueClosure.getToken().type}'.`,
						{},
						argumentValueClosure.str,
						argumentValueClosure.getToken(),
						'AST Parser'
					);
				}

				inputFieldArguments.push(this.parseArgument(argumentNameLiteral, argumentValueClosure));
			} else {
				throw new ParsingError(
					ErrorLevel.ERROR,
					'failed to parse',
					`Encountered invalid token. Expected token to be of type '${InputFieldTokenType.COMMA}' but received '${tempElement[2].getToken().type}'.`,
					{},
					tempElement[2].str,
					tempElement[2].getToken(),
					'AST Parser'
				);
			}
		}

		// if (closure.children.length === 2) {
		// 	const argumentNameLiteral = closure.getChild(0, InputFieldTokenType.WORD) as AST_Literal;
		// 	const argumentValueClosure = closure.getChild(1, InputFieldTokenType.L_PAREN) as AST_Closure;
		// 	inputFieldArguments.push(this.parseArgument(argumentNameLiteral, argumentValueClosure));
		// 	return;
		// }
		//
		// for (let i = 0; i < closure.children.length - 3; i += 3) {
		// 	const argumentNameLiteral = closure.getChild(i, InputFieldTokenType.WORD) as AST_Literal;
		// 	const argumentValueClosure = closure.getChild(i + 1, InputFieldTokenType.L_PAREN) as AST_Closure;
		// 	closure.getChild(i + 2, InputFieldTokenType.COMMA);
		// 	inputFieldArguments.push(this.parseArgument(argumentNameLiteral, argumentValueClosure));
		// }

		this.parseArgumentsIntoContainer(inputFieldArguments);
	}

	private parseArgument(argumentNameLiteral: AST_Literal, argumentValueClosure: AST_Closure | undefined): { type: InputFieldArgumentType; value: string } {
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
							new MetaBindParsingError(ErrorLevel.WARNING, 'failed to parse input field arguments', `argument "${argument.type}" requires a non empty value`)
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

	private validateNodeAndThrow(astNode: Abstract_AST_Node, validationGraph: ValidationGraph): void {
		if (!validationGraph.validateAST(astNode)) {
			const layout = validationGraph.layout;

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
	}

	private parseInputFieldType(astLiteral: AST_Literal): InputFieldType {
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

	private parseInputFieldArgumentType(astLiteral: AST_Literal): InputFieldArgumentType {
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
			const astParser = new InputFieldASTParser(fullDeclaration, tokens);
			const ast = astParser.parse();
			const declarationParser = new DeclarationParser(this.plugin, filePath, fullDeclaration, tokens, ast, errorCollection);

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

// export class InputFieldParser {
// 	/**
// 	 * This expects the full declaration.
// 	 * @example `INPUT[slider(addLabels, minValue(-10), maxValue(10)):bind target#frontmatter field]`
// 	 *
// 	 * @param fullDeclaration
// 	 */
// 	static parseString(fullDeclaration: string): InputFieldDeclaration {
// 		const tokenizer = new InputFieldTokenizer(fullDeclaration);
// 		const tokens = tokenizer.getTokens();
// 	}
// }

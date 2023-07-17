import { ErrorLevel, ErrorType, MetaBindError } from '../../utils/errors/MetaBindErrors';
import { InputFieldType } from '../InputFieldDeclarationParser';
import { BindTargetDeclaration } from '../BindTargetParser';
import { InputFieldArgumentContainer } from '../../inputFieldArguments/InputFieldArgumentContainer';
import { ErrorCollection } from '../../utils/errors/ErrorCollection';

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

export const InputFieldTokenType = {
	ILLEGAL: 'ILLEGAL',
	EOF: 'EOF',
	WORD: 'WORD',
	L_PAREN: '(',
	R_PAREN: ')',
	L_SQUARE: '[',
	R_SQUARE: ']',
	COLON: ':',
	HASHTAG: '#',
	DOT: '.',
	COMMA: ',',
	QUOTE: '"',
} as const;

const InputFieldClosures: Closure<InputFieldTokenItem>[] = [
	{
		openingTokenType: InputFieldTokenType.L_PAREN,
		closingTokenType: InputFieldTokenType.R_PAREN,
	},
	{
		openingTokenType: InputFieldTokenType.L_SQUARE,
		closingTokenType: InputFieldTokenType.R_SQUARE,
	},
];

type InputFieldTokenItem = typeof InputFieldTokenType[keyof typeof InputFieldTokenType];

export interface Range {
	from: number;
	to: number;
}

export interface InputFieldToken extends AbstractToken<InputFieldTokenItem> {}

function createToken(type: InputFieldTokenItem, literal: string, from: number, to: number): InputFieldToken {
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
			if (this.ch === '"') {
				token = this.createToken(InputFieldTokenType.QUOTE);
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
			} else if (this.ch === '"') {
				token = this.createToken(InputFieldTokenType.QUOTE);
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

	private createToken(type: InputFieldTokenItem, char?: string): InputFieldToken {
		return createToken(type, char !== undefined ? char : this.ch, this.position, this.position);
	}
}

export enum AST_El_Type {
	LITERAL = 'LITERAL',
	CLOSURE = 'CLOSURE',
	ROOT = 'ROOT',

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

	abstract toDebugString(): string;
}

export interface LayoutDefinitionLoop {
	layout: AST_El_Type[];
	min: number;
	max: number;
}

export type LayoutDefinition = (AST_El_Type | LayoutDefinitionLoop)[];

function simplifyLayoutDefinition(layout: LayoutDefinition): LayoutDefinition {
	let newLayout: LayoutDefinition = [];

	for (const layoutElement of layout) {
		if (typeof layoutElement === 'object') {
			for (let i = 0; i < layoutElement.min; i++) {
				newLayout = newLayout.concat(layoutElement.layout);
			}

			if (layoutElement.max - layoutElement.min > 0) {
				newLayout.push({
					layout: layoutElement.layout,
					min: 0,
					max: layoutElement.max - layoutElement.min,
				});
			}
		} else {
			newLayout.push(layoutElement);
		}
	}

	return newLayout;
}

export abstract class Abstract_AST_Node extends Abstract_AST_El {
	children: AST_El[];

	protected constructor(type: AST_El_Type, str: string, children: AST_El[]) {
		super(type, str);
		this.children = children;
	}

	public test(layout: LayoutDefinition): boolean {
		layout = simplifyLayoutDefinition(layout);
		console.log('------------------------------------------------------');
		console.log(layout);

		const res = this.testLayout(layout, 0, 0);

		// console.log('res', res);

		if (res === -1) {
			return false;
		}

		// we expect to be at the end of the children
		if (this.children[res]) {
			// console.log('res', res);
			return false;
		}

		return true;
	}

	testLayout(layout: LayoutDefinition, layoutIndex: number, childIndex: number): number {
		console.log('rec layout', layout, layoutIndex, childIndex);

		while (layoutIndex < layout.length) {
			const layoutElement = layout[layoutIndex];
			const child: AST_El | undefined = this.children[childIndex];

			// console.log('iteration', layoutIndex, childIndex, layoutElement, this.children[childIndex]?.type);

			if (child === undefined) {
				return -1;
			}

			if (typeof layoutElement === 'object') {
				let newIndex = -1;
				let currentChildIndex = childIndex;

				for (let i = 0; i <= layoutElement.max; i++) {
					let res = childIndex;

					if (i !== 0) {
						res = this.testLayout(layoutElement.layout, 0, currentChildIndex);
					}

					// console.log('iter res', layoutIndex, i, res);

					if (res !== -1) {
						currentChildIndex = res;

						const res2 = this.testLayout(layout, layoutIndex + 1, currentChildIndex);
						// console.log('iter res2', layoutIndex + 1, currentChildIndex, i, res2);
						if (res2 !== -1) {
							newIndex = res2;
							break;
						}
					}
				}

				if (newIndex !== -1 && layoutIndex < layout.length) {
					return newIndex + 1;
				} else {
					return -1;
				}
			} else {
				if (layoutElement !== child.type) {
					return -1;
				}
				childIndex += 1;
			}

			layoutIndex += 1;
		}

		return childIndex;
	}

	testLayoutRec(layout: LayoutDefinition, childIndex: number, maxRepeats: number): number {
		console.log('rec layout', JSON.stringify(layout), childIndex, maxRepeats);

		let repeatCounter = 0;

		while (repeatCounter < maxRepeats) {
			let layoutIndex = 0;
			const iterStartIndex = childIndex;
			console.log('repeat', repeatCounter, childIndex, JSON.stringify(layout));

			while (layoutIndex < layout.length) {
				const layoutElement = layout[layoutIndex];
				const child: AST_El | undefined = this.children[childIndex];

				if (child === undefined) {
					console.log('rec parsing failed, child undefined', repeatCounter, childIndex, iterStartIndex);
					return iterStartIndex;
				}

				if (typeof layoutElement === 'object') {
					const res = this.testLayoutRec(layoutElement.layout, childIndex, layoutElement.max);
					if (res === -1) {
						console.log('rec parsing failed, rec failed', repeatCounter, childIndex, iterStartIndex);
						return iterStartIndex;
					}
					childIndex = res;
				} else {
					if (layoutElement !== child.type) {
						console.log('rec parsing failed, no token match', repeatCounter, childIndex, iterStartIndex);
						return iterStartIndex;
					}
					childIndex += 1;
				}

				layoutIndex += 1;
			}

			repeatCounter += 1;
		}

		return childIndex;
	}

	testChildLayout(layout: AST_El_Type[]): boolean {
		for (let i = 0; i < Math.max(this.children.length, layout.length); i++) {
			const layoutItem: AST_El_Type | undefined = layout[i];
			const child: (AST_Literal | AST_Closure) | undefined = this.children[i];

			if (layoutItem === undefined && child === undefined) {
				throw new Error('this parser sucks');
			}

			if (layoutItem === undefined) {
				return false;
			}

			if (child === undefined || child.getToken().type === InputFieldTokenType.EOF) {
				return false;
			}

			if (layoutItem !== child.type) {
				return false;
			}
		}

		return true;
	}

	testChildLayouts(layouts: AST_El_Type[][]): void {
		let correct = false;
		for (const layout of layouts) {
			if (this.testChildLayout(layout)) {
				correct = true;
			}
		}

		if (!correct) {
			throw new ParsingError(
				ErrorLevel.ERROR,
				'failed to parse',
				`Encountered invalid token. Expected token types to be of order ${layouts.map(x => x.toString()).join(' or ')} but received ${this.children.map(x => x.type)}.`,
				{},
				this.str,
				this.getToken(),
				'AST Parser'
			);
		}
	}

	getChild(index: number, expected?: InputFieldTokenItem | undefined): AST_El {
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
	private readonly closureStack: Closure<InputFieldTokenItem>[];
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

	private parseClosure(openingLiteral: AST_Literal, closure: Closure<InputFieldTokenItem>): AST_El | undefined {
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

export interface InputFieldDeclaration {
	parsingData: InputFieldParsingData | undefined;
	type: InputFieldType;
	bindTarget: BindTargetDeclaration | undefined;
	argumentContainer: InputFieldArgumentContainer;
	errorCollection: ErrorCollection;
}

export class DeclarationParser {
	fullDeclaration: string;
	tokens: InputFieldToken[];
	ast: AST_Root;

	type: InputFieldType;
	bindTarget: BindTargetDeclaration | undefined;
	argumentContainer: InputFieldArgumentContainer;
	errorCollection: ErrorCollection;

	constructor(fullDeclaration: string, tokens: InputFieldToken[], ast: AST_Root, errorCollection: ErrorCollection) {
		this.fullDeclaration = fullDeclaration;
		this.tokens = tokens;
		this.ast = ast;
		this.errorCollection = errorCollection;

		this.type = InputFieldType.INVALID;
		this.argumentContainer = new InputFieldArgumentContainer();
	}

	private parseDeclaration(): InputFieldDeclaration {
		// literal.closure or literal.closure.closure
		this.ast.testChildLayouts([
			[AST_El_Type.LITERAL, AST_El_Type.CLOSURE],
			[AST_El_Type.LITERAL, AST_El_Type.CLOSURE, AST_El_Type.CLOSURE],
		]);
		const inputLiteral = this.ast.getChild(0, InputFieldTokenType.WORD) as AST_Literal;
		inputLiteral.checkContent('INPUT', false);

		if (this.ast.children.length === 2) {
			const pureDeclarationClosure = this.ast.getChild(1, InputFieldTokenType.L_SQUARE) as AST_Closure;
			this.parsePureDeclaration(pureDeclarationClosure);
		} else if (this.ast.children.length === 3) {
			const templateClosure = this.ast.getChild(1, InputFieldTokenType.L_SQUARE) as AST_Closure;
			this.parsePureDeclaration(templateClosure);

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
			parsingData: {
				fullDeclaration: this.fullDeclaration,
				tokens: this.tokens,
				ast: this.ast,
			},
			type: this.type,
			bindTarget: this.bindTarget,
			argumentContainer: this.argumentContainer,
			errorCollection: this.errorCollection,
		};
	}

	private parseTemplate(closure: AST_Closure): void {
		// TODO
	}

	private parsePureDeclaration(closure: AST_Closure): void {}

	private parseType(): void {}
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

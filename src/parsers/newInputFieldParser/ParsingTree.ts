import { ParsingError } from './ParsingError';
import { ErrorLevel } from '../../utils/errors/MetaBindErrors';
import { AbstractToken, Range } from './ParsingUtils';
import { InputFieldTokenType } from './InputFieldTokenizer';

export enum PT_Element_Type {
	LITERAL = 'LITERAL',
	CLOSURE = 'CLOSURE',
	ROOT = 'ROOT',

	SPECIAL_END = 'SPECIAL_END',
}

export abstract class Abstract_PT_El<TokenType extends string, Token extends AbstractToken<TokenType>> {
	type: PT_Element_Type;
	str: string;

	protected constructor(type: PT_Element_Type, str: string) {
		this.type = type;
		this.str = str;
	}

	abstract getToken(): Token | undefined;

	abstract toLiteral(): string;

	abstract toDebugString(): string;
}

export abstract class Abstract_PT_Node<TokenType extends string, Token extends AbstractToken<TokenType>> extends Abstract_PT_El<TokenType, Token> {
	children: PT_Element<TokenType, Token>[];

	protected constructor(type: PT_Element_Type, str: string, children: PT_Element<TokenType, Token>[]) {
		super(type, str);
		this.children = children;
	}

	getChild(index: number, expected?: InputFieldTokenType | undefined): PT_Element<TokenType, Token> {
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

	abstract getRange(): Range;
}

export class PT_Literal<TokenType extends string, Token extends AbstractToken<TokenType>> extends Abstract_PT_El<TokenType, Token> {
	token: Token;

	constructor(token: Token, str: string) {
		super(PT_Element_Type.LITERAL, str);

		this.token = token;
	}

	public getRange(): Range {
		return this.token.range;
	}

	public getToken(): Token {
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

export class PT_Closure<TokenType extends string, Token extends AbstractToken<TokenType>> extends Abstract_PT_Node<TokenType, Token> {
	startLiteral: PT_Literal<TokenType, Token>;
	endLiteral: PT_Literal<TokenType, Token>;

	constructor(str: string, startLiteral: PT_Literal<TokenType, Token>, endLiteral: PT_Literal<TokenType, Token>, children: PT_Element<TokenType, Token>[]) {
		super(PT_Element_Type.CLOSURE, str, children);

		this.startLiteral = startLiteral;
		this.endLiteral = endLiteral;
	}

	public getRange(): Range {
		return {
			from: this.startLiteral.token.range.from,
			to: this.startLiteral.token.range.to,
		};
	}

	public getToken(): Token {
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

export type PT_Element<TokenType extends string, Token extends AbstractToken<TokenType>> = PT_Literal<TokenType, Token> | PT_Closure<TokenType, Token>;

export class ParsingTree<TokenType extends string, Token extends AbstractToken<TokenType>> extends Abstract_PT_Node<TokenType, Token> {
	tokens: Token[];

	constructor(str: string, tokens: Token[]) {
		super(PT_Element_Type.ROOT, str, []);

		this.tokens = tokens;
	}

	public getToken(): Token | undefined {
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

	public getRange(): Range {
		return {
			from: this.tokens[0]?.range.from ?? 0,
			to: this.tokens[this.tokens.length - 1]?.range.to ?? 0,
		};
	}
}

// export function split_PT_Elements(list: PT_Element[], tokenType: InputFieldTokenType): PT_Element[][] {
// 	const out: PT_Element[][] = [];
// 	let current: PT_Element[] = [];
//
// 	for (const listElement of list) {
// 		if (listElement.getToken().type === tokenType) {
// 			out.push(current);
// 			current = [];
// 		} else {
// 			current.push(listElement);
// 		}
// 	}
//
// 	out.push(current);
//
// 	return out;
// }

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

type InputFieldTokenItem = typeof InputFieldTokenType[keyof typeof InputFieldTokenType];

export interface Range {
	from: number;
	to: number;
}

export interface InputFieldToken {
	type: InputFieldTokenItem;
	literal: string;
	range: Range;
}

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

const ASTEL_type = {
	LITERAL: 'LITERAL',
	CLOSURE: 'CLOSURE',
	ROOT: 'ROOT',
} as const;

type ASTEL_item = typeof ASTEL_type[keyof typeof ASTEL_type];

export abstract class AbstractASTEL {
	type: ASTEL_item;

	protected constructor(type: ASTEL_item) {
		this.type = type;
	}

	abstract toDebugString(): string;
}

export class ASTEL_Literal extends AbstractASTEL {
	token: InputFieldToken;

	constructor(token: InputFieldToken) {
		super(ASTEL_type.LITERAL);

		this.token = token;
	}

	toDebugString(): string {
		return this.token.literal;
	}
}

export class ASTEL_Closure extends AbstractASTEL {
	startLiteral: ASTEL_Literal;
	endLiteral: ASTEL_Literal;
	children: AbstractASTEL[];

	constructor(startLiteral: ASTEL_Literal, endLiteral: ASTEL_Literal, children: AbstractASTEL[]) {
		super(ASTEL_type.CLOSURE);

		this.startLiteral = startLiteral;
		this.endLiteral = endLiteral;
		this.children = children;
	}

	getRange(): Range {
		return {
			from: this.startLiteral.token.range.from,
			to: this.startLiteral.token.range.to,
		};
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

export class ASTEL_Root extends AbstractASTEL {
	str: string;
	children: AbstractASTEL[];

	constructor(str: string) {
		super(ASTEL_type.ROOT);

		this.str = str;
		this.children = [];
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
	private astRoot: ASTEL_Root;

	constructor(str: string, tokens: InputFieldToken[]) {
		this.tokens = tokens;
		this.astRoot = new ASTEL_Root(str);
	}

	public parse(): ASTEL_Root {
		let i = 0;
		while (this.tokens[i].type !== InputFieldTokenType.EOF) {
			const res = this.parseAt(i);
			this.astRoot.children.push(res.astel);
			i = res.index;

			if (i >= this.tokens.length) {
				throw new Error('index to big');
			}
		}

		return this.astRoot;
	}

	private parseAt(index: number): { astel: AbstractASTEL; index: number } {
		const token = this.tokens[index];

		const astelLiteral = new ASTEL_Literal(token);

		// start of L_PAREN closure
		const closures = [
			{
				openingTokenType: InputFieldTokenType.L_PAREN,
				closingTokenType: InputFieldTokenType.R_PAREN,
			},
			{
				openingTokenType: InputFieldTokenType.L_SQUARE,
				closingTokenType: InputFieldTokenType.R_SQUARE,
			},
		] as const;

		for (const closure of closures) {
			const closureRes = this.parseClosure(index, astelLiteral, closure.openingTokenType, closure.closingTokenType);
			if (closureRes) {
				return closureRes;
			}
		}

		return {
			astel: astelLiteral,
			index: index + 1,
		};
	}

	private parseClosure(
		index: number,
		openingLiteral: ASTEL_Literal,
		openingTokenType: InputFieldTokenItem,
		closingTokenType: InputFieldTokenItem
	): { astel: AbstractASTEL; index: number } | undefined {
		if (openingLiteral.token.type !== openingTokenType) {
			return undefined;
		}

		let closingLiteral: ASTEL_Literal | undefined;
		const children: AbstractASTEL[] = [];

		index += 1;
		while (this.tokens[index].type !== InputFieldTokenType.EOF) {
			const nestedRes = this.parseAt(index);

			if (nestedRes.astel.type === ASTEL_type.LITERAL && (nestedRes.astel as ASTEL_Literal).token.type === closingTokenType) {
				closingLiteral = nestedRes.astel as ASTEL_Literal;
				break;
			} else {
				children.push(nestedRes.astel);
			}

			index = nestedRes.index;
		}

		if (!closingLiteral) {
			// ERROR
			throw new Error('Closure is not closed');
		}

		const closure = new ASTEL_Closure(openingLiteral, closingLiteral, children);

		return {
			astel: closure,
			index: index + 1,
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

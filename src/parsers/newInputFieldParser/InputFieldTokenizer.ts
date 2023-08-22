import { AbstractToken, Closure } from './ParsingUtils';

export enum InputFieldTokenType {
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

export const InputFieldClosures: Closure<InputFieldTokenType>[] = [
	{
		openingTokenType: InputFieldTokenType.L_PAREN,
		closingTokenType: InputFieldTokenType.R_PAREN,
	},
	{
		openingTokenType: InputFieldTokenType.L_SQUARE,
		closingTokenType: InputFieldTokenType.R_SQUARE,
	},
];

export interface InputFieldToken extends AbstractToken<InputFieldTokenType> {}

export function createToken<TokenType extends string>(type: TokenType, literal: string, from: number, to: number): AbstractToken<TokenType> {
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
	private tokens: InputFieldToken[];
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

		this.tokens = this.tokens.filter(x => x.type !== InputFieldTokenType.QUOTE);

		return this.tokens;
	}

	private readNextToken(): void {
		let token: InputFieldToken | undefined;

		if (this.inQuotes) {
			if (this.ch === "'") {
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
			} else if (this.ch === "'") {
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

	private createToken(type: InputFieldTokenType, char?: string): InputFieldToken {
		return createToken(type, char !== undefined ? char : this.ch, this.position, this.position);
	}
}

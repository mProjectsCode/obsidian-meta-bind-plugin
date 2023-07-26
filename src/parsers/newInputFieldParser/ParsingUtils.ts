export interface AbstractToken<TokenType extends string> {
	type: TokenType;
	literal: string;
	range: Range;
}

export interface Closure<TokenType extends string> {
	openingTokenType: TokenType;
	closingTokenType: TokenType;
}

export interface Range {
	from: number;
	to: number;
}

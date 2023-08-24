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

export const EOF_TOKEN = '__EOF__' as const;

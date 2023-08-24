import { VG_Transition_Constraint } from '../VG_Transition_Constraint';
import { PT_Element_Type } from '../../ParsingTree';
import { AbstractToken } from '../../ParsingUtils';

export enum TL_Type {
	LOOP = 'LOOP',
	OR = 'OR',
	LITERAL = 'LITERAL',
}

export class TL_LoopBound {
	min: number;
	max: number;

	constructor(min: number, max: number) {
		this.min = min;
		this.max = max;
	}

	public isEqual(other: TL_LoopBound): boolean {
		return this.min === other.min && this.max === other.max;
	}

	public violates(count: number): boolean {
		if (this.min !== -1 && count < this.min) {
			return true;
		}

		if (this.max !== -1 && count >= this.max) {
			return true;
		}

		return false;
	}

	public isEmpty(): boolean {
		return this.min === -1 && this.max === -1;
	}
}

export class TL_Literal<TokenType extends string, Token extends AbstractToken<TokenType>, Key extends string> {
	readonly type: TL_Type;
	readonly key: Key | undefined;
	readonly constraint: VG_Transition_Constraint<TokenType, Token>;

	constructor(astType: PT_Element_Type, tokenType?: TokenType | undefined, literalContent?: string | undefined, key?: Key | undefined) {
		this.type = TL_Type.LITERAL;
		this.key = key;

		this.constraint = new VG_Transition_Constraint(astType, tokenType, literalContent);
	}
}

export class TL_Loop<TokenType extends string, Token extends AbstractToken<TokenType>, Key extends string> {
	readonly type: TL_Type;
	readonly key: Key | undefined;
	readonly loop: TreeLayout<TokenType, Token, Key>;
	readonly bound: TL_LoopBound;

	constructor(loop: TreeLayout<TokenType, Token, Key>, bound: TL_LoopBound, key?: Key | undefined) {
		this.type = TL_Type.LOOP;
		this.key = key;

		this.loop = loop;
		this.bound = bound;
	}
}

export class TL_Or<TokenType extends string, Token extends AbstractToken<TokenType>, Key extends string> {
	readonly type: TL_Type;
	readonly key: Key | undefined;
	readonly options: TreeLayout<TokenType, Token, Key>[];

	constructor(options: TreeLayout<TokenType, Token, Key>[], key?: Key | undefined) {
		this.type = TL_Type.OR;
		this.key = key;

		this.options = options;
	}
}

export type TL_Element<TokenType extends string, Token extends AbstractToken<TokenType>, Key extends string> =
	| TL_Literal<TokenType, Token, Key>
	| TL_Loop<TokenType, Token, Key>
	| TL_Or<TokenType, Token, Key>;
export type TreeLayout<TokenType extends string, Token extends AbstractToken<TokenType>, Key extends string> = TL_Element<TokenType, Token, Key>[];

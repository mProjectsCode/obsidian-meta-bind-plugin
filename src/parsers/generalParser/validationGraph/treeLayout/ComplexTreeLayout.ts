import { TL_Element, TL_Literal, TL_Loop, TL_LoopBound, TL_Or } from './TreeLayout';
import { PT_Element_Type } from '../../ParsingTree';
import { AbstractToken } from '../../ParsingUtils';

export abstract class Abstract_TL_C<TokenType extends string, Token extends AbstractToken<TokenType>, Key extends string> {
	public key: Key | undefined;

	protected constructor(key: Key | undefined) {
		this.key = key;
	}

	abstract toTL(): TL_Element<TokenType, Token, Key>;
}

export class TL_C_Optional<TokenType extends string, Token extends AbstractToken<TokenType>, Key extends string> extends Abstract_TL_C<TokenType, Token, Key> {
	readonly option: ComplexTreeLayout<TokenType, Token, Key>;

	constructor(option: ComplexTreeLayout<TokenType, Token, Key>, key?: Key | undefined) {
		super(key);

		this.option = option;
	}

	public toTL(): TL_Element<TokenType, Token, Key> {
		return new TL_Or([[], this.option.map(x => x.toTL())], this.key);
	}
}

export class TL_C_Loop<TokenType extends string, Token extends AbstractToken<TokenType>, Key extends string> extends Abstract_TL_C<TokenType, Token, Key> {
	readonly loop: ComplexTreeLayout<TokenType, Token, Key>;
	readonly min: number;
	readonly max: number;

	constructor(loop: ComplexTreeLayout<TokenType, Token, Key>, min: number = -1, max: number = -1, key?: Key | undefined) {
		super(key);

		this.loop = loop;
		this.min = min;
		this.max = max;
	}

	public toTL(): TL_Element<TokenType, Token, Key> {
		return new TL_Loop(
			this.loop.map(x => x.toTL()),
			new TL_LoopBound(this.min, this.max),
			this.key
		);
	}
}

export class TL_C_Enumeration<TokenType extends string, Token extends AbstractToken<TokenType>, Key extends string> extends Abstract_TL_C<
	TokenType,
	Token,
	Key
> {
	readonly loop: ComplexTreeLayout<TokenType, Token, Key>;
	readonly separator: ComplexTreeLayout<TokenType, Token, Key>;

	constructor(loop: ComplexTreeLayout<TokenType, Token, Key>, separator: ComplexTreeLayout<TokenType, Token, Key>, key?: Key | undefined) {
		super(key);

		this.loop = loop;
		this.separator = separator;
	}

	public toTL(): TL_Element<TokenType, Token, Key> {
		// TODO: test the loop bound 1, 1
		// the loop bound 1, 1 is done because of the key
		return new TL_Or([
			[],
			[
				new TL_Loop(
					this.loop.map(x => x.toTL()),
					new TL_LoopBound(1, 1),
					this.key
				),
			],
			[
				new TL_Loop([...this.loop.map(x => x.toTL()), ...this.separator.map(x => x.toTL())], new TL_LoopBound(1, -1), this.key),
				new TL_Loop(
					this.loop.map(x => x.toTL()),
					new TL_LoopBound(1, 1),
					this.key
				),
			],
		]);

		// return new TL_Loop(
		// 	this.loop.map(x => x.toTL()),
		// 	new TL_LoopBound(this.min, this.max)
		// );
	}
}

export class TL_C_Or<TokenType extends string, Token extends AbstractToken<TokenType>, Key extends string> extends Abstract_TL_C<TokenType, Token, Key> {
	readonly options: ComplexTreeLayout<TokenType, Token, Key>[];

	constructor(options: ComplexTreeLayout<TokenType, Token, Key>[]) {
		super(undefined);

		this.options = options;
	}

	public toTL(): TL_Element<TokenType, Token, Key> {
		return new TL_Or(this.options.map(x => x.map(y => y.toTL())));
	}
}

export class TL_C_Literal<TokenType extends string, Token extends AbstractToken<TokenType>, Key extends string> extends Abstract_TL_C<TokenType, Token, Key> {
	readonly astType: PT_Element_Type;
	readonly tokenType: TokenType | undefined;
	readonly literalContent: string | undefined;

	constructor(astType: PT_Element_Type, tokenType?: TokenType | undefined, literalContent?: string | undefined, key?: Key | undefined) {
		super(key);
		this.astType = astType;
		this.tokenType = tokenType;
		this.literalContent = literalContent;
	}

	public toTL(): TL_Element<TokenType, Token, Key> {
		return new TL_Literal(this.astType, this.tokenType, this.literalContent, this.key);
	}
}

export type TL_C_Element<TokenType extends string, Token extends AbstractToken<TokenType>, Key extends string> =
	| TL_C_Literal<TokenType, Token, Key>
	| TL_C_Loop<TokenType, Token, Key>
	| TL_C_Or<TokenType, Token, Key>
	| TL_C_Optional<TokenType, Token, Key>
	| TL_C_Enumeration<TokenType, Token, Key>;
export type ComplexTreeLayout<TokenType extends string, Token extends AbstractToken<TokenType>, Key extends string> = TL_C_Element<TokenType, Token, Key>[];

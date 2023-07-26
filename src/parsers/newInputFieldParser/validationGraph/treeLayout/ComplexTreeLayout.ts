import { TL_Element, TL_Literal, TL_Loop, TL_LoopBound, TL_Or } from './TreeLayout';
import { PT_Element_Type } from '../../ParsingTree';
import { InputFieldTokenType } from '../../InputFieldTokenizer';

export abstract class Abstract_TL_C {
	public key: string | undefined;

	protected constructor(key: string | undefined) {
		this.key = key;
	}

	abstract toTL(): TL_Element;
}

export class TL_C_Optional extends Abstract_TL_C {
	readonly option: ComplexTreeLayout;

	constructor(option: ComplexTreeLayout, key?: string | undefined) {
		super(key);

		this.option = option;
	}

	public toTL(): TL_Element {
		return new TL_Or([[], this.option.map(x => x.toTL())], this.key);
	}
}

export class TL_C_Loop extends Abstract_TL_C {
	readonly loop: ComplexTreeLayout;
	readonly min: number;
	readonly max: number;

	constructor(loop: ComplexTreeLayout, min: number, max: number, key?: string | undefined) {
		super(key);

		this.loop = loop;
		this.min = min;
		this.max = max;
	}

	public toTL(): TL_Element {
		return new TL_Loop(
			this.loop.map(x => x.toTL()),
			new TL_LoopBound(this.min, this.max),
			this.key
		);
	}
}

export class TL_C_Enumeration extends Abstract_TL_C {
	readonly loop: ComplexTreeLayout;
	readonly separator: ComplexTreeLayout;

	constructor(loop: ComplexTreeLayout, separator: ComplexTreeLayout, key?: string | undefined) {
		super(key);

		this.loop = loop;
		this.separator = separator;
	}

	public toTL(): TL_Element {
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
				new TL_Loop([...this.loop.map(x => x.toTL()), ...this.separator.map(x => x.toTL())], new TL_LoopBound(-1, -1), this.key),
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

export class TL_C_Or extends Abstract_TL_C {
	readonly options: ComplexTreeLayout[];

	constructor(options: ComplexTreeLayout[]) {
		super(undefined);

		this.options = options;
	}

	public toTL(): TL_Element {
		return new TL_Or(this.options.map(x => x.map(y => y.toTL())));
	}
}

export class TL_C_Literal extends Abstract_TL_C {
	readonly astType: PT_Element_Type;
	readonly tokenType: InputFieldTokenType | undefined;
	readonly literalContent: string | undefined;

	constructor(astType: PT_Element_Type, tokenType?: InputFieldTokenType | undefined, literalContent?: string | undefined, key?: string | undefined) {
		super(key);
		this.astType = astType;
		this.tokenType = tokenType;
		this.literalContent = literalContent;
	}

	public toTL(): TL_Element {
		return new TL_Literal(this.astType, this.tokenType, this.literalContent, this.key);
	}
}

export type TL_C_Element = TL_C_Literal | TL_C_Loop | TL_C_Or | TL_C_Optional | TL_C_Enumeration;
export type ComplexTreeLayout = TL_C_Element[];

import { InputFieldTokenType } from '../../InputFieldTokenizer';
import { VG_Transition_Constraint } from '../VG_Transition_Constraint';
import { PT_Element_Type } from '../../ParsingTree';

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

export class TL_Literal {
	readonly type: TL_Type;
	readonly key: string | undefined;
	readonly constraint: VG_Transition_Constraint;

	constructor(astType: PT_Element_Type, tokenType?: InputFieldTokenType | undefined, literalContent?: string | undefined, key?: string | undefined) {
		this.type = TL_Type.LITERAL;
		this.key = key;

		this.constraint = new VG_Transition_Constraint(astType, tokenType, literalContent);
	}
}

export class TL_Loop {
	readonly type: TL_Type;
	readonly key: string | undefined;
	readonly loop: TreeLayout;
	readonly bound: TL_LoopBound;

	constructor(loop: TreeLayout, bound: TL_LoopBound, key?: string | undefined) {
		this.type = TL_Type.LOOP;
		this.key = key;

		this.loop = loop;
		this.bound = bound;
	}
}

export class TL_Or {
	readonly type: TL_Type;
	readonly key: string | undefined;
	readonly options: TreeLayout[];

	constructor(options: TreeLayout[], key?: string | undefined) {
		this.type = TL_Type.OR;
		this.key = key;

		this.options = options;
	}
}

export type TL_Element = TL_Literal | TL_Loop | TL_Or;
export type TreeLayout = TL_Element[];

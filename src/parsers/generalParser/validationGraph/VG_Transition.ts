import { VG_Transition_Constraint } from './VG_Transition_Constraint';
import { ContextAction } from './ContextActions';
import { TL_LoopBound } from './treeLayout/TreeLayout';
import { PT_Element } from '../ParsingTree';
import { AbstractToken } from '../ParsingUtils';

export class VG_Transition<TokenType extends string, Token extends AbstractToken<TokenType>, Key extends string> {
	readonly from: number;
	readonly to: number;
	readonly constraint: VG_Transition_Constraint<TokenType, Token> | undefined;
	readonly key: Key | undefined;
	readonly contextActions: ContextAction<Key>[];
	readonly loopBound: TL_LoopBound;

	constructor(
		from: number,
		to: number,
		constraint: VG_Transition_Constraint<TokenType, Token> | undefined,
		loopBound: TL_LoopBound | undefined,
		key: Key | undefined,
		contextActions: ContextAction<Key>[] | undefined
	) {
		this.from = from;
		this.to = to;
		this.constraint = constraint;
		this.loopBound = loopBound ?? new TL_LoopBound(-1, -1);
		this.key = key;
		this.contextActions = contextActions ?? [];
	}

	public isEqual(other: VG_Transition<TokenType, Token, Key>): boolean {
		return this.from === other.from && this.to === other.to && this.isConstraintEqual(other) && this.isLoopBoundEqual(other) && this.key === other.key;
	}

	private isConstraintEqual(other: VG_Transition<TokenType, Token, Key>): boolean {
		if (this.constraint !== undefined && other.constraint !== undefined) {
			return this.constraint.isEqual(other.constraint);
		}

		return this.constraint === undefined && other.constraint === undefined;
	}

	private isLoopBoundEqual(other: VG_Transition<TokenType, Token, Key>): boolean {
		return this.loopBound.isEqual(other.loopBound);
	}

	public canTransition(astEl: PT_Element<TokenType, Token> | undefined, nodeCount: number): boolean {
		if (this.loopBound.violates(nodeCount)) {
			return false;
		}

		// this is empty, allow transition
		if (this.constraint === undefined) {
			return true;
		}

		return this.constraint.canTransition(astEl);
	}

	public isEmpty(): boolean {
		return this.constraint === undefined && this.key === undefined && this.contextActions.length === 0 && this.loopBound.isEmpty();
	}
}

import { VG_Transition_Constraint } from './VG_Transition_Constraint';
import { TL_LoopBound } from './treeLayout/TreeLayout';
import { VG_Transition } from './VG_Transition';
import { ContextAction } from './ContextActions';
import { AbstractToken } from '../ParsingUtils';

export class VG_Node<TokenType extends string, Token extends AbstractToken<TokenType>, Key extends string> {
	readonly index: number;
	transitionConstraint: VG_Transition_Constraint<TokenType, Token> | undefined;
	final: boolean;
	loopBound: TL_LoopBound;
	transitions: VG_Transition<TokenType, Token, Key>[];
	// distanceToFinalNode: number;

	constructor(
		index: number,
		transitionConstraint: VG_Transition_Constraint<TokenType, Token> | undefined,
		final: boolean = false,
		loopBound?: TL_LoopBound | undefined
	) {
		this.index = index;
		this.transitionConstraint = transitionConstraint;
		this.final = final;
		this.loopBound = loopBound ?? new TL_LoopBound(-1, -1);
		this.transitions = [];
		// this.distanceToFinalNode = Number.MAX_VALUE;
	}

	public createTransition(
		to: number,
		constraint: VG_Transition_Constraint<TokenType, Token> | undefined,
		loopBound: TL_LoopBound | undefined,
		key: Key | undefined,
		contextActions: ContextAction<Key>[] | undefined
	): void {
		const newTransition = new VG_Transition(this.index, to, constraint, loopBound, key, contextActions);

		for (const transition of this.transitions) {
			if (transition.isEqual(newTransition)) {
				return;
			}
		}

		this.transitions.push(newTransition);
	}
}

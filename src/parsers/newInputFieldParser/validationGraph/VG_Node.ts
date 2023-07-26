import { VG_Transition_Constraint } from './VG_Transition_Constraint';
import { TL_LoopBound } from './treeLayout/TreeLayout';
import { VG_Transition } from './VG_Transition';
import { ContextAction } from './ContextActions';

export class VG_Node {
	readonly index: number;
	transitionConstraint: VG_Transition_Constraint | undefined;
	final: boolean;
	loopBound: TL_LoopBound;
	transitions: VG_Transition[];

	// readonly contextKey: string | undefined;

	constructor(index: number, transitionConstraint: VG_Transition_Constraint | undefined, final: boolean = false, loopBound?: TL_LoopBound | undefined) {
		this.index = index;
		this.transitionConstraint = transitionConstraint;
		this.final = final;
		this.loopBound = loopBound ?? new TL_LoopBound(-1, -1);
		this.transitions = [];
		// this.contextKey = contextKey;
	}

	public createTransition(
		to: number,
		constraint: VG_Transition_Constraint | undefined,
		loopBound: TL_LoopBound | undefined,
		key: string | undefined,
		contextActions: ContextAction[] | undefined
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

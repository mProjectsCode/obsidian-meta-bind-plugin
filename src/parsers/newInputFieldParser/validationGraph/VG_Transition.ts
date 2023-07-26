import { VG_Transition_Constraint } from './VG_Transition_Constraint';
import { ContextAction } from './ContextActions';
import { TL_LoopBound } from './treeLayout/TreeLayout';
import { PT_Element } from '../ParsingTree';

export class VG_Transition {
	readonly from: number;
	readonly to: number;
	readonly constraint: VG_Transition_Constraint | undefined;
	readonly key: string | undefined;
	readonly contextActions: ContextAction[];
	readonly loopBound: TL_LoopBound;

	constructor(
		from: number,
		to: number,
		constraint: VG_Transition_Constraint | undefined,
		loopBound: TL_LoopBound | undefined,
		key: string | undefined,
		contextActions: ContextAction[] | undefined
	) {
		this.from = from;
		this.to = to;
		this.constraint = constraint;
		this.loopBound = loopBound ?? new TL_LoopBound(-1, -1);
		this.key = key;
		this.contextActions = contextActions ?? [];
	}

	public isEqual(other: VG_Transition): boolean {
		return this.from === other.from && this.to === other.to && this.isConstraintEqual(other) && this.isLoopBoundEqual(other) && this.key === other.key;
	}

	private isConstraintEqual(other: VG_Transition): boolean {
		if (this.constraint !== undefined && other.constraint !== undefined) {
			return this.constraint.isEqual(other.constraint);
		}

		return this.constraint === undefined && other.constraint === undefined;
	}

	private isLoopBoundEqual(other: VG_Transition): boolean {
		return this.loopBound.isEqual(other.loopBound);
	}

	public canTransition(astEl: PT_Element | undefined, nodeCount: number): boolean {
		// if (this.loopMin !== -1 && nodeCount < this.loopMin) {
		// 	return new ParsingError(
		// 		ErrorLevel.ERROR,
		// 		'failed to parse',
		// 		`Loop bound not satisfied. Expected node count '${nodeCount}' to be higher than or equal to '${this.loopMin}'.`,
		// 		{},
		// 		astEl.str,
		// 		astEl.getToken(),
		// 		'Validation Graph'
		// 	);
		// }
		//
		// if (this.loopMax !== -1 && nodeCount >= this.loopMax) {
		// 	return new ParsingError(
		// 		ErrorLevel.ERROR,
		// 		'failed to parse',
		// 		`Loop bound not satisfied. Expected node count '${nodeCount}' to be less than '${this.loopMax}'.`,
		// 		{},
		// 		astEl.str,
		// 		astEl.getToken(),
		// 		'Validation Graph'
		// 	);
		// }

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

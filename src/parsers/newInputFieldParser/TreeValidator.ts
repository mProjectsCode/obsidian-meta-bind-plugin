import { Abstract_AST_Node, AST_El, AST_El_Type, InputFieldTokenType, ParsingError } from './InputFieldParser';
import { ErrorLevel } from '../../utils/errors/MetaBindErrors';

export enum TL_Type {
	LOOP = 'LOOP',
	OR = 'OR',
	LITERAL = 'LITERAL',
}

export class TL_Literal {
	type: TL_Type;
	constraint: VG_Transition_Constraint;

	constructor(astType: AST_El_Type, tokenType?: InputFieldTokenType | undefined, literalContent?: string | undefined) {
		this.type = TL_Type.LITERAL;

		this.constraint = new VG_Transition_Constraint(astType, tokenType, literalContent);
	}
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
			return false;
		}

		if (this.max !== -1 && count >= this.max) {
			return false;
		}

		return true;
	}
}

export class TL_Loop {
	readonly type: TL_Type;
	readonly loop: TreeLayout;
	readonly bound: TL_LoopBound;

	constructor(loop: TreeLayout, bound: TL_LoopBound) {
		this.type = TL_Type.LOOP;

		this.loop = loop;
		this.bound = bound;
	}
}

export class TL_Or {
	readonly type: TL_Type;
	readonly option1: TreeLayout;
	readonly option2: TreeLayout;
	readonly allowNone: boolean;

	constructor(option1: TreeLayout, option2: TreeLayout, allowNone: boolean = false) {
		this.type = TL_Type.OR;

		this.option1 = option1;
		this.option2 = option2;
		this.allowNone = allowNone;
	}
}

export abstract class Abstract_TL_C {
	abstract toTL(): TL_Element;
}

export class TL_C_Optional extends Abstract_TL_C {
	readonly option: ComplexTreeLayout;

	constructor(option: ComplexTreeLayout) {
		super();

		this.option = option;
	}

	public toTL(): TL_Element {
		return new TL_Or(
			[],
			this.option.map(x => x.toTL())
		);
	}
}

export class TL_C_Loop extends Abstract_TL_C {
	readonly loop: ComplexTreeLayout;
	readonly min: number;
	readonly max: number;

	constructor(loop: ComplexTreeLayout, min: number, max: number) {
		super();

		this.loop = loop;
		this.min = min;
		this.max = max;
	}

	public toTL(): TL_Element {
		return new TL_Loop(
			this.loop.map(x => x.toTL()),
			new TL_LoopBound(this.min, this.max)
		);
	}
}

export class TL_C_Or extends Abstract_TL_C {
	readonly option1: ComplexTreeLayout;
	readonly option2: ComplexTreeLayout;
	readonly allowNone: boolean;

	constructor(option1: ComplexTreeLayout, option2: ComplexTreeLayout, allowNone: boolean = false) {
		super();

		this.option1 = option1;
		this.option2 = option2;
		this.allowNone = allowNone;
	}

	public toTL(): TL_Element {
		return new TL_Or(
			this.option1.map(x => x.toTL()),
			this.option2.map(x => x.toTL()),
			this.allowNone
		);
	}
}

export class TL_C_Literal extends Abstract_TL_C {
	readonly astType: AST_El_Type;
	readonly tokenType: InputFieldTokenType | undefined;
	readonly literalContent: string | undefined;

	constructor(astType: AST_El_Type, tokenType?: InputFieldTokenType | undefined, literalContent?: string | undefined) {
		super();
		this.astType = astType;
		this.tokenType = tokenType;
		this.literalContent = literalContent;
	}

	public toTL(): TL_Element {
		return new TL_Literal(this.astType, this.tokenType, this.literalContent);
	}
}

export type TL_Element = TL_Literal | TL_Loop | TL_Or;
export type TL_C_Element = TL_C_Literal | TL_C_Loop | TL_C_Or | TL_C_Optional;

export type TreeLayout = TL_Element[];
export type ComplexTreeLayout = TL_C_Element[];

export class VG_Transition_Constraint {
	readonly astType: AST_El_Type;
	readonly tokenType: InputFieldTokenType | undefined;
	readonly literalContent: string | undefined;

	constructor(astType: AST_El_Type, tokenType?: InputFieldTokenType | undefined, literalContent?: string | undefined) {
		this.astType = astType;
		this.tokenType = tokenType;
		this.literalContent = literalContent;
	}

	public canTransition(astEl: AST_El): boolean {
		if (astEl.type !== this.astType) {
			// return new ParsingError(
			// 	ErrorLevel.ERROR,
			// 	'failed to parse',
			// 	`Encountered invalid token. Expected token to be of type '${this.astType}' but received '${astEl.type}'.`,
			// 	{},
			// 	astEl.str,
			// 	astEl.getToken(),
			// 	'Validation Graph'
			// );
			return false;
		}

		if (this.tokenType !== undefined && astEl.getToken().type !== this.tokenType) {
			// return new ParsingError(
			// 	ErrorLevel.ERROR,
			// 	'failed to parse',
			// 	`Encountered invalid token. Expected token to be '${this.tokenType}' but received '${astEl.getToken().type}'.`,
			// 	{},
			// 	astEl.str,
			// 	astEl.getToken(),
			// 	'Validation Graph'
			// );
			return false;
		}

		if (this.literalContent !== undefined && astEl.toLiteral() !== this.literalContent) {
			// return new ParsingError(
			// 	ErrorLevel.ERROR,
			// 	'failed to parse',
			// 	`Encountered invalid token. Expected token to contain literal '${this.literalContent}' but received '${astEl.toLiteral()}'.`,
			// 	{},
			// 	astEl.str,
			// 	astEl.getToken(),
			// 	'Validation Graph'
			// );
			return false;
		}

		return true;
	}

	public isEqual(other: VG_Transition_Constraint): boolean {
		return this.astType === other.astType && this.tokenType === other.tokenType && this.literalContent === other.literalContent;
	}

	public toString(): string {
		if (this.tokenType !== undefined && this.literalContent !== undefined) {
			return `${this.astType}, ${this.tokenType}, ${this.literalContent}`;
		}

		if (this.tokenType !== undefined) {
			return `${this.astType}, ${this.tokenType}`;
		}

		if (this.literalContent !== undefined) {
			return `${this.astType}, ${this.literalContent}`;
		}

		return this.astType;
	}
}

export class VG_Transition {
	readonly from: number;
	readonly to: number;
	readonly constraint: VG_Transition_Constraint | undefined;
	readonly loopBound: TL_LoopBound;

	constructor(from: number, to: number, constraint: VG_Transition_Constraint | undefined, loopBound: TL_LoopBound | undefined) {
		this.from = from;
		this.to = to;
		this.constraint = constraint;
		this.loopBound = loopBound ?? new TL_LoopBound(-1, -1);
	}

	public isEqual(other: VG_Transition): boolean {
		return this.from === other.from && this.to === other.to && this.isConstraintEqual(other) && this.isLoopBoundEqual(other);
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

	public canTransition(astEl: AST_El, nodeCount: number): boolean {
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
		if (this.isEmpty()) {
			return true;
		}

		return this.constraint?.canTransition(astEl) ?? true;
	}

	public isEmpty(): boolean {
		return this.constraint === undefined;
	}
}

export class VG_Node {
	readonly index: number;
	transitionConstraint: VG_Transition_Constraint | undefined;
	final: boolean;
	loopBound: TL_LoopBound;
	transitions: VG_Transition[];

	constructor(index: number, transitionConstraint: VG_Transition_Constraint | undefined, final: boolean = false, loopBound?: TL_LoopBound | undefined) {
		this.index = index;
		this.transitionConstraint = transitionConstraint;
		this.final = final;
		this.loopBound = loopBound ?? new TL_LoopBound(-1, -1);
		this.transitions = [];
	}

	public createTransition(to: number, constraint: VG_Transition_Constraint | undefined, loopBound: TL_LoopBound | undefined): void {
		const newTransition = new VG_Transition(this.index, to, constraint, loopBound);

		for (const transition of this.transitions) {
			if (transition.isEqual(newTransition)) {
				return;
			}
		}

		this.transitions.push(newTransition);
	}
}

// export class ValidationGraphLoopNode extends ValidationGraphNode {
// 	constructor(index: number[]) {
// 		super(index);
// 	}
//
// 	createTransition(to: number[], input: AST_El_Type, loopMin: number, loopMax: number) {}
// }

type GraphNode = VG_Node; //| ValidationGraphLoopNode;

interface ValidationState {
	active: boolean;
	// errors: ParsingError[];
	failure: ValidationFailure | undefined;
	nodeStates: number[];
}

interface ValidationFailure {
	astEl: AST_El;
	loopCount: number;
	violatedConstraints: ValidationConstraint[];
}

interface ValidationConstraint {
	transitionConstraint: VG_Transition_Constraint;
	loopBound: TL_LoopBound;
}

export class ValidationGraph {
	layout: TreeLayout;
	nodes: GraphNode[];
	state: ValidationState[];
	private nodeIndexCounter: number;

	constructor(treeLayout: ComplexTreeLayout) {
		this.layout = treeLayout.map(x => x.toTL());
		console.log(this.layout);
		this.nodes = [];
		this.state = [];
		this.nodeIndexCounter = 0;

		this.nodes.push(new VG_Node(-1, undefined));

		this.parseTreeLayout(this.layout, this.nodes[0]);

		// const endNode = new VG_Node(this.nodeIndexCounter, AST_El_Type.SPECIAL_END);
		// this.nodeIndexCounter += 1;
		// this.nodes[this.nodes.length - 1].createTransition(endNode.index, AST_El_Type.SPECIAL_END);
		// this.nodes.push(endNode);

		this.nodes[this.nodes.length - 1].final = true;
	}

	private parseTreeLayout(treeLayout: TreeLayout, previousNode: VG_Node): { first: VG_Node; last: VG_Node } {
		let firstNode: VG_Node | undefined;
		let lastNode: VG_Node | undefined;

		for (let i = 0; i < treeLayout.length; i++) {
			const currentLayout = treeLayout[i];

			if (currentLayout instanceof TL_Loop) {
				const res = this.parseTreeLayout(currentLayout.loop, previousNode);

				// set the min loop bound for the last node this is for the exit transition
				if (currentLayout.bound.min === 0) {
					// TODO: why are we doing this?
					// shouldn't loop bound 0 and -1 behave the same? (more or less)
					res.last.loopBound.min = 1;

					previousNode.createTransition(res.last.index, undefined, undefined);
				} else {
					res.last.loopBound.min = currentLayout.bound.min;
				}

				// set the max loop bound for the last node this is for the exit transition
				// res.last.loopBound.max = currentLayout.bound.max;

				// create the loop back transition
				res.last.createTransition(res.first.index, res.first.transitionConstraint, new TL_LoopBound(-1, currentLayout.bound.max));

				if (!firstNode) {
					firstNode = res.first;
				}

				if (i === treeLayout.length - 1) {
					lastNode = res.last;
				}

				previousNode = res.last;
			} else if (currentLayout instanceof TL_Or) {
				// create an empty node in front of the split
				const emptyNodePre = new VG_Node(this.nodeIndexCounter, undefined);
				this.nodeIndexCounter += 1;
				this.nodes.push(emptyNodePre);

				// add an empty transition to it
				previousNode.createTransition(emptyNodePre.index, undefined, undefined);

				// to the two options
				const res1 = this.parseTreeLayout(currentLayout.option1, emptyNodePre);
				const res2 = this.parseTreeLayout(currentLayout.option2, emptyNodePre);

				// create an empty node after the split
				const emptyNodePost = new VG_Node(this.nodeIndexCounter, undefined);
				this.nodeIndexCounter += 1;
				this.nodes.push(emptyNodePost);

				// create the empty transitions to the node
				res1.last.createTransition(emptyNodePost.index, undefined, undefined);
				res2.last.createTransition(emptyNodePost.index, undefined, undefined);

				// if the or can none, create an empty transition from the pre to the post node
				if (currentLayout.allowNone) {
					emptyNodePre.createTransition(emptyNodePost.index, undefined, undefined);
				}

				if (!firstNode) {
					firstNode = emptyNodePre;
				}

				if (i === treeLayout.length - 1) {
					lastNode = emptyNodePost;
				}

				previousNode = emptyNodePost;
			} else if (currentLayout instanceof TL_Literal) {
				const currentNode = new VG_Node(this.nodeIndexCounter, currentLayout.constraint);
				this.nodeIndexCounter += 1;
				this.nodes.push(currentNode);

				previousNode.createTransition(currentNode.index, currentLayout.constraint, previousNode.loopBound);

				if (!firstNode) {
					firstNode = currentNode;
				}

				if (i === treeLayout.length - 1) {
					lastNode = currentNode;
				}

				previousNode = currentNode;
			}
		}

		if (!firstNode || !lastNode) {
			// if the tree layout was length 0, create an empty node
			if (treeLayout.length === 0) {
				const emptyNode = new VG_Node(this.nodeIndexCounter, undefined);
				this.nodeIndexCounter += 1;
				this.nodes.push(emptyNode);

				previousNode.createTransition(emptyNode.index, undefined, undefined);

				firstNode = emptyNode;
				lastNode = emptyNode;
			} else {
				console.log(treeLayout.length, firstNode, lastNode);
				throw new Error('this parser sucks');
			}
		}

		return {
			first: firstNode,
			last: lastNode,
		};
	}

	public optimizeParsingGraph(): void {
		console.log('optimize transitions');

		for (const node of this.nodes) {
			if (node.index === -1) {
				continue;
			}

			if (node.transitions.length === 0 && !node.final) {
				console.warn('node with no outgoing transitions found', node);
				continue;
			}

			console.log('node', node);

			const incomingTransitions = this.getIncomingTransitions(node);

			let hasOnlyEmptyIncomingTransitions = true;

			for (const incomingTransition of incomingTransitions) {
				if (!incomingTransition.transition.isEmpty()) {
					hasOnlyEmptyIncomingTransitions = false;
				}
			}

			console.log('node transition', incomingTransitions);

			if (hasOnlyEmptyIncomingTransitions) {
				for (const incomingTransition of incomingTransitions) {
					console.log('node transition a', incomingTransition);
					incomingTransition.node.transitions.remove(incomingTransition.transition);

					if (node.index === incomingTransition.node.index) {
						continue;
					}

					if (node.final) {
						incomingTransition.node.final = true;
					}

					for (const transition of node.transitions) {
						incomingTransition.node.createTransition(transition.to, transition.constraint, transition.loopBound);
					}
				}
			}
		}

		console.log('remove nodes');

		const newNodes: VG_Node[] = [];

		// remove every node that has no incoming transitions
		for (const node of this.nodes) {
			if (node.index === -1) {
				newNodes.push(node);
				continue;
			}

			const incomingTransitions = this.getIncomingTransitions(node);

			if (incomingTransitions.length > 0) {
				newNodes.push(node);
			}
		}

		this.nodes = newNodes;
	}

	private getIncomingTransitions(node: VG_Node): { transition: VG_Transition; node: VG_Node }[] {
		const transitions: { transition: VG_Transition; node: VG_Node }[] = [];

		for (const otherNode of this.nodes) {
			for (const transition of otherNode.transitions) {
				if (transition.to === node.index) {
					transitions.push({
						transition: transition,
						node: otherNode,
					});
				}
			}
		}

		return transitions;
	}

	public getNode(index: number): VG_Node | undefined {
		return this.nodes.find(x => x.index === index);
	}

	public validateAST(astNode: Abstract_AST_Node): boolean {
		this.state = [
			{
				active: true,
				failure: undefined,
				nodeStates: [-1],
			},
		];

		for (const astChild of astNode.children) {
			const newStates: ValidationState[] = [];

			for (const validationState of this.state) {
				if (!validationState.active) {
					continue;
				}

				const currentState = validationState.nodeStates[validationState.nodeStates.length - 1];
				const node = this.getNode(currentState);
				if (!node) {
					throw new Error('this parser sucks');
				}

				const loopCount = validationState.nodeStates.filter(x => x === node.index).length;

				// TODO: maybe move this to the graph optimization
				const transitions = this.preprocessTransitions(node.transitions);

				const violatedConstraints: ValidationConstraint[] = [];
				let allTransitionsFailed = true;

				for (const transition of transitions) {
					const transitionError = transition.canTransition(astChild, loopCount);

					if (!transitionError) {
						newStates.push({
							active: true,
							failure: undefined,
							nodeStates: validationState.nodeStates.concat([transition.to]),
						});
						allTransitionsFailed = false;
					} else {
						if (!transition.constraint) {
							throw new Error('This parser sucks');
						}

						violatedConstraints.push({
							transitionConstraint: transition.constraint,
							loopBound: transition.loopBound,
						});
					}

					// if (transition.input === type) {
					// 	if ((transition.loopMin === -1 || nodeCount >= transition.loopMin) && (transition.loopMax === -1 || nodeCount < transition.loopMax)) {
					// 		newStates.push({
					// 			nodeState: validationState.nodeState.concat([transition.to]),
					// 		});
					// 	}
					// }
				}

				if (allTransitionsFailed) {
					// TODO: maybe modify the object instead of creating a new one.
					newStates.push({
						active: false,
						failure: {
							astEl: astChild,
							loopCount: loopCount,
							violatedConstraints: violatedConstraints,
						},
						nodeStates: validationState.nodeStates,
					});
				}
			}

			this.state = newStates;
		}

		console.log('parsing state');
		console.log(this.state);

		const validResults = this.state.filter(x => {
			const lastNode = this.getNode(x.nodeStates[x.nodeStates.length - 1]);
			return lastNode ? lastNode.final : false;
		});

		// console.log(validResults);

		return validResults.length > 0;
	}

	/**
	 * Removes all empty transitions
	 * @param transitions
	 */
	private preprocessTransitions(transitions: VG_Transition[]): VG_Transition[] {
		let newTransitions: VG_Transition[] = [];

		for (const transition of transitions) {
			if (transition.isEmpty()) {
				const node = this.getNode(transition.to);
				if (!node) {
					console.log(transition);
					console.log(this.nodes);
					throw new Error('this parser sucks');
				}

				newTransitions = newTransitions.concat(this.preprocessTransitions(node.transitions));
			} else {
				newTransitions.push(transition);
			}
		}

		return newTransitions;
	}
}

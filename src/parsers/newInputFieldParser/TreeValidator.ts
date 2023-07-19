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

export class TL_Loop {
	readonly type: TL_Type;
	readonly loop: TreeLayout;
	readonly min: number;
	readonly max: number;

	constructor(loop: TreeLayout, min: number, max: number) {
		this.type = TL_Type.LOOP;

		this.loop = loop;
		this.min = min;
		this.max = max;
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
			this.min,
			this.max
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

	public canTransition(astEl: AST_El): ParsingError | undefined {
		if (astEl.type !== this.astType) {
			return new ParsingError(
				ErrorLevel.ERROR,
				'failed to parse',
				`Encountered invalid token. Expected token to be of type '${this.astType}' but received '${astEl.type}'.`,
				{},
				astEl.str,
				astEl.getToken(),
				'Validation Graph'
			);
		}

		if (this.tokenType !== undefined && astEl.getToken().type !== this.tokenType) {
			return new ParsingError(
				ErrorLevel.ERROR,
				'failed to parse',
				`Encountered invalid token. Expected token to be '${this.tokenType}' but received '${astEl.getToken().type}'.`,
				{},
				astEl.str,
				astEl.getToken(),
				'Validation Graph'
			);
		}

		if (this.literalContent !== undefined && astEl.toLiteral() !== this.literalContent) {
			return new ParsingError(
				ErrorLevel.ERROR,
				'failed to parse',
				`Encountered invalid token. Expected token to contain literal '${this.literalContent}' but received '${astEl.toLiteral()}'.`,
				{},
				astEl.str,
				astEl.getToken(),
				'Validation Graph'
			);
		}

		return undefined;
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
	readonly loopMin: number;
	readonly loopMax: number;

	constructor(from: number, to: number, constraint: VG_Transition_Constraint | undefined, loopMin: number, loopMax: number) {
		this.from = from;
		this.to = to;
		this.constraint = constraint;
		this.loopMin = loopMin;
		this.loopMax = loopMax;
	}

	public isEqual(other: VG_Transition): boolean {
		return this.from === other.from && this.to === other.to && this.isConstraintEqual(other) && this.loopMin === other.loopMin && this.loopMax === other.loopMax;
	}

	private isConstraintEqual(other: VG_Transition): boolean {
		if (this.constraint !== undefined && other.constraint !== undefined) {
			return this.constraint.isEqual(other.constraint);
		}

		return this.constraint === undefined && other.constraint === undefined;
	}

	public canTransition(astEl: AST_El, nodeCount: number): ParsingError | undefined {
		if (this.loopMin !== -1 && nodeCount < this.loopMin) {
			return new ParsingError(
				ErrorLevel.ERROR,
				'failed to parse',
				`Loop bound not satisfied. Expected node count '${nodeCount}' to be higher than or equal to '${this.loopMin}'.`,
				{},
				astEl.str,
				astEl.getToken(),
				'Validation Graph'
			);
		}

		if (this.loopMax !== -1 && nodeCount >= this.loopMax) {
			return new ParsingError(
				ErrorLevel.ERROR,
				'failed to parse',
				`Loop bound not satisfied. Expected node count '${nodeCount}' to be less than '${this.loopMax}'.`,
				{},
				astEl.str,
				astEl.getToken(),
				'Validation Graph'
			);
		}

		// this is empty, allow transition
		if (this.isEmpty()) {
			return undefined;
		}

		return this.constraint?.canTransition(astEl);
	}

	public isEmpty(): boolean {
		return this.constraint === undefined;
	}
}

export class VG_Node {
	readonly index: number;
	transitionConstraint: VG_Transition_Constraint | undefined;
	final: boolean;
	loopMin: number;
	loopMax: number;
	transitions: VG_Transition[];

	constructor(index: number, transitionConstraint: VG_Transition_Constraint | undefined, final: boolean = false, loopMin: number = -1, loopMax: number = -1) {
		this.index = index;
		this.transitionConstraint = transitionConstraint;
		this.final = final;
		this.loopMin = loopMin;
		this.loopMax = loopMax;
		this.transitions = [];
	}

	public createTransition(to: number, constraint: VG_Transition_Constraint | undefined, loopMin: number = -1, loopMax: number = -1): void {
		const newTransition = new VG_Transition(this.index, to, constraint, loopMin, loopMax);

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
	nodeState: number[];
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

				if (currentLayout.min === 0) {
					res.last.loopMin = 1;

					previousNode.createTransition(res.last.index, undefined);
				} else {
					res.last.loopMin = currentLayout.min;
				}

				res.last.loopMax = currentLayout.max;

				res.last.createTransition(res.first.index, res.first.transitionConstraint, -1, res.last.loopMax);

				if (!firstNode) {
					firstNode = res.first;
				}

				if (i === treeLayout.length - 1) {
					lastNode = res.last;
				}

				previousNode = res.last;
			} else if (currentLayout instanceof TL_Or) {
				const emptyNodePre = new VG_Node(this.nodeIndexCounter, undefined);
				this.nodeIndexCounter += 1;
				this.nodes.push(emptyNodePre);

				previousNode.createTransition(emptyNodePre.index, undefined);

				const res1 = this.parseTreeLayout(currentLayout.option1, emptyNodePre);
				const res2 = this.parseTreeLayout(currentLayout.option2, emptyNodePre);

				const emptyNodePost = new VG_Node(this.nodeIndexCounter, undefined);
				this.nodeIndexCounter += 1;
				this.nodes.push(emptyNodePost);

				res1.last.createTransition(emptyNodePost.index, undefined);
				res2.last.createTransition(emptyNodePost.index, undefined);

				if (currentLayout.allowNone) {
					emptyNodePre.createTransition(emptyNodePost.index, undefined);
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

				previousNode.createTransition(currentNode.index, currentLayout.constraint, previousNode.loopMin, -1);

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
			if (treeLayout.length === 0) {
				const emptyNode = new VG_Node(this.nodeIndexCounter, undefined);
				this.nodeIndexCounter += 1;
				this.nodes.push(emptyNode);

				previousNode.createTransition(emptyNode.index, undefined);

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
						incomingTransition.node.createTransition(transition.to, transition.constraint, transition.loopMin, transition.loopMax);
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
				nodeState: [-1],
			},
		];

		const astElTypes = astNode.children.map(x => x.type);
		astElTypes.push(AST_El_Type.SPECIAL_END);

		for (const astChild of astNode.children) {
			const newStates: ValidationState[] = [];

			for (const validationState of this.state) {
				const currentState = validationState.nodeState[validationState.nodeState.length - 1];
				const node = this.getNode(currentState);
				if (!node) {
					throw new Error('this parser sucks');
				}

				const nodeCount = validationState.nodeState.filter(x => x === node.index).length;

				const transitions = this.preprocessTransitions(node.transitions);

				for (const transition of transitions) {
					const transitionError = transition.canTransition(astChild, nodeCount);

					if (!transitionError) {
						newStates.push({
							nodeState: validationState.nodeState.concat([transition.to]),
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
			}

			this.state = newStates;
		}

		const validResults = this.state.filter(x => {
			const lastNode = this.getNode(x.nodeState[x.nodeState.length - 1]);
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

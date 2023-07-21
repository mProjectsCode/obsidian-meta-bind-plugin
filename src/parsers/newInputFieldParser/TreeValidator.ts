import { Abstract_AST_Node, AST_El, AST_El_Type, InputFieldTokenType, ParsingError } from './InputFieldParser';
import { deepCopy } from '../../utils/Utils';
import { traverseObjectByPath } from '@opd-libs/opd-utils-lib/lib/ObjectTraversalUtils';

export enum TL_Type {
	LOOP = 'LOOP',
	OR = 'OR',
	LITERAL = 'LITERAL',
}

export class TL_Literal {
	readonly type: TL_Type;
	readonly key: string | undefined;
	readonly constraint: VG_Transition_Constraint;

	constructor(astType: AST_El_Type, tokenType?: InputFieldTokenType | undefined, literalContent?: string | undefined, key?: string | undefined) {
		this.type = TL_Type.LITERAL;
		this.key = key;

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
	readonly astType: AST_El_Type;
	readonly tokenType: InputFieldTokenType | undefined;
	readonly literalContent: string | undefined;

	constructor(astType: AST_El_Type, tokenType?: InputFieldTokenType | undefined, literalContent?: string | undefined, key?: string | undefined) {
		super(key);
		this.astType = astType;
		this.tokenType = tokenType;
		this.literalContent = literalContent;
	}

	public toTL(): TL_Element {
		return new TL_Literal(this.astType, this.tokenType, this.literalContent, this.key);
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

export enum ContextActionType {
	POP = 'POP',
	PUSH = 'PUSH',
}

export interface ContextPopAction {
	type: ContextActionType.POP;
}

export interface ContextPushAction {
	type: ContextActionType.PUSH;
	key: string;
}

export type ContextAction = ContextPopAction | ContextPushAction;

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
		if (this.constraint === undefined) {
			return true;
		}

		return this.constraint.canTransition(astEl);
	}

	public isEmpty(): boolean {
		return this.constraint === undefined && this.key === undefined && this.contextActions.length === 0 && this.loopBound.isEmpty();
	}
}

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
	currentInputIndex: number;
	context: ValidationContext;
	currentContextStack: (string | number)[];
	failure: ValidationFailure | undefined;
	nodeStates: number[];
}

/*
 * TODO
 * The state needs a context.
 * A context can be nested. Meaning a context can contain an array of sub contexts.
 * A transition can do two context operations:
 *  - pop the context, meaning go to the parent context
 *  - push context, meaning create a sub context with a key, creating the sub context array of the key or adding an element to it
 */

interface ValidationFailure {
	astEl: AST_El;
	loopCount: number;
	violatedConstraints: ValidationConstraint[];
}

interface ValidationConstraint {
	transitionConstraint: VG_Transition_Constraint | undefined;
	loopBound: TL_LoopBound;
}

type ValidationContext = Record<string, AST_El | ValidationContext[]>;

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
				// create an empty node before the loop
				const emptyNodePre = new VG_Node(this.nodeIndexCounter, undefined);
				this.nodeIndexCounter += 1;
				this.nodes.push(emptyNodePre);

				// add an empty transition to it
				if (currentLayout.key !== undefined) {
					previousNode.createTransition(emptyNodePre.index, undefined, undefined, undefined, [
						{ type: ContextActionType.PUSH, key: currentLayout.key },
					]);
				} else {
					previousNode.createTransition(emptyNodePre.index, undefined, undefined, undefined, undefined);
				}

				const res = this.parseTreeLayout(currentLayout.loop, emptyNodePre);

				// create an empty node after the loop
				const emptyNodePost = new VG_Node(this.nodeIndexCounter, undefined);
				this.nodeIndexCounter += 1;
				this.nodes.push(emptyNodePost);

				if (currentLayout.key !== undefined) {
					res.last.createTransition(emptyNodePost.index, undefined, new TL_LoopBound(currentLayout.bound.min, -1), undefined, [
						{ type: ContextActionType.POP },
					]);
				} else {
					res.last.createTransition(emptyNodePost.index, undefined, new TL_LoopBound(currentLayout.bound.min, -1), undefined, undefined);
				}

				// set the min loop bound for the last node this is for the exit transition
				if (currentLayout.bound.min === 0) {
					// TODO: why are we doing this?
					// shouldn't loop bound 0 and -1 behave the same? (more or less)
					res.last.loopBound.min = 1;

					previousNode.createTransition(emptyNodePost.index, undefined, undefined, undefined, undefined);
				} else {
					res.last.loopBound.min = currentLayout.bound.min;
				}

				// set the max loop bound for the last node this is for the exit transition
				// res.last.loopBound.max = currentLayout.bound.max;

				// create the loop back transition
				if (currentLayout.key !== undefined) {
					res.last.createTransition(emptyNodePre.index, undefined, new TL_LoopBound(-1, currentLayout.bound.max), undefined, [
						{ type: ContextActionType.POP },
						{ type: ContextActionType.PUSH, key: currentLayout.key },
					]);
				} else {
					res.last.createTransition(emptyNodePre.index, undefined, new TL_LoopBound(-1, currentLayout.bound.max), undefined, undefined);
				}

				if (!firstNode) {
					firstNode = emptyNodePre;
				}

				if (i === treeLayout.length - 1) {
					lastNode = emptyNodePost;
				}

				previousNode = emptyNodePost;
			} else if (currentLayout instanceof TL_Or) {
				// create an empty node in front of the split
				const emptyNodePre = new VG_Node(this.nodeIndexCounter, undefined);
				this.nodeIndexCounter += 1;
				this.nodes.push(emptyNodePre);

				// add an empty transition to it
				previousNode.createTransition(emptyNodePre.index, undefined, undefined, undefined, undefined);

				// the options
				const resArr = [];
				for (const option of currentLayout.options) {
					resArr.push(this.parseTreeLayout(option, emptyNodePre));
				}

				// create an empty node after the split
				const emptyNodePost = new VG_Node(this.nodeIndexCounter, undefined);
				this.nodeIndexCounter += 1;
				this.nodes.push(emptyNodePost);

				// create the empty transitions to the node
				for (const res of resArr) {
					res.last.createTransition(emptyNodePost.index, undefined, undefined, undefined, undefined);
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

				console.log('current layout key', currentLayout.key);

				previousNode.createTransition(currentNode.index, currentLayout.constraint, previousNode.loopBound, currentLayout.key, undefined);

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

				previousNode.createTransition(emptyNode.index, undefined, undefined, undefined, undefined);

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
		for (let i = this.nodes.length - 1; i >= 0; i--) {
			for (const transition of this.nodes[i].transitions) {
				if (transition.isEmpty()) {
					const node = this.getNode(transition.to);
					if (node?.final) {
						this.nodes[i].final = true;
					}
				}
			}
		}

		for (const node of this.nodes) {
			if (node.index === -1) {
				continue;
			}

			if (node.transitions.length === 0 && !node.final) {
				console.warn('node with no outgoing transitions found', node);
				continue;
			}

			const incomingTransitions = this.getIncomingTransitions(node);

			let hasOnlyEmptyIncomingTransitions = true;

			for (const incomingTransition of incomingTransitions) {
				if (!incomingTransition.transition.isEmpty()) {
					hasOnlyEmptyIncomingTransitions = false;
				}
			}

			if (hasOnlyEmptyIncomingTransitions) {
				for (const incomingTransition of incomingTransitions) {
					incomingTransition.node.transitions.remove(incomingTransition.transition);

					if (node.index === incomingTransition.node.index) {
						continue;
					}

					for (const transition of node.transitions) {
						incomingTransition.node.createTransition(
							transition.to,
							transition.constraint,
							transition.loopBound,
							transition.key,
							transition.contextActions
						);
					}
				}
			}
		}

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
				currentInputIndex: -1,
				context: {},
				currentContextStack: [],
				failure: undefined,
				nodeStates: [-1],
			},
		];

		for (let astIndex = 0; astIndex < astNode.children.length; astIndex++) {
			const astChild = astNode.children[astIndex];

			while (this.hasUnfinishedStates(this.state, astIndex)) {
				const newStates: ValidationState[] = [];

				for (const validationState of this.state) {
					if (!validationState.active || validationState.currentInputIndex === astIndex) {
						newStates.push(validationState);
						continue;
					}

					const currentState = validationState.nodeStates[validationState.nodeStates.length - 1];
					const node = this.getNode(currentState);
					if (!node) {
						throw new Error('this parser sucks');
					}

					const loopCount = validationState.nodeStates.filter(x => x === node.index).length;

					const violatedConstraints: ValidationConstraint[] = [];
					let allTransitionsFailed = true;

					for (const transition of node.transitions) {
						const canTransition = transition.canTransition(astChild, loopCount);
						// console.log(transition, canTransition, astChild);

						if (canTransition) {
							const newContext = deepCopy(validationState.context);
							const newContextStack = [...validationState.currentContextStack];
							let currentContext: ValidationContext = traverseObjectByPath(newContextStack as string[], newContext);
							console.log(currentContext);

							// do the current key first
							if (transition.key !== undefined) {
								currentContext[transition.key] = astChild;
							}

							// do context actions
							for (const contextAction of transition.contextActions) {
								if (contextAction.type === ContextActionType.POP) {
									newContextStack.pop();
									newContextStack.pop();
									currentContext = traverseObjectByPath(newContextStack as string[], newContext);
								} else {
									if (currentContext[contextAction.key] === undefined) {
										currentContext[contextAction.key] = [] as ValidationContext[];
									}

									const subContextArray = currentContext[contextAction.key] as ValidationContext[];
									const newSubContext: ValidationContext = {};

									subContextArray.push(newSubContext);
									newContextStack.push(contextAction.key);
									newContextStack.push(subContextArray.length - 1);
									currentContext = newSubContext;
								}
							}

							// console.log('test 1');

							if (transition.constraint === undefined) {
								const transitionToNode = this.getNode(transition.to);
								if (!transitionToNode) {
									throw new Error('this parser sucks');
								}
								// console.log('test 2');

								for (const relayedTransition of transitionToNode.transitions) {
									newStates.push({
										active: true,
										currentInputIndex: validationState.currentInputIndex,
										context: deepCopy(newContext),
										currentContextStack: [...newContextStack],
										failure: undefined,
										nodeStates: validationState.nodeStates.concat([transition.to]),
									});
								}
							} else {
								// push the new state
								newStates.push({
									active: true,
									currentInputIndex: astIndex,
									context: newContext,
									currentContextStack: newContextStack,
									failure: undefined,
									nodeStates: validationState.nodeStates.concat([transition.to]),
								});
							}
							allTransitionsFailed = false;
						} else {
							violatedConstraints.push({
								transitionConstraint: transition.constraint,
								loopBound: transition.loopBound,
							});
						}
					}

					if (allTransitionsFailed) {
						console.log('all transitions failed', node.transitions, node, astIndex, validationState);

						// TODO: maybe modify the object instead of creating a new one.
						newStates.push({
							active: false,
							context: validationState.context,
							currentInputIndex: astIndex,
							currentContextStack: validationState.currentContextStack,
							failure: {
								astEl: astChild,
								loopCount: loopCount,
								violatedConstraints: violatedConstraints,
							},
							nodeStates: validationState.nodeStates,
						});
					}
				}

				console.log(newStates);

				this.state = newStates;
			}
		}

		console.log('parsing state');
		console.log(this.state);

		const validResults = this.state.filter(x => {
			if (!x.active) {
				return false;
			}

			const lastNode = this.getNode(x.nodeStates[x.nodeStates.length - 1]);
			return lastNode ? lastNode.final : false;
		});

		console.log(validResults);

		return validResults.length > 0;
	}

	private hasUnfinishedStates(states: ValidationState[], astIndex: number): boolean {
		for (const state of states) {
			if (state.active && state.currentInputIndex !== astIndex) {
				return true;
			}
		}

		return false;
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

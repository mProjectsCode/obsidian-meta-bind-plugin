import { traverseObjectByPath } from '@opd-libs/opd-utils-lib/lib/ObjectTraversalUtils';
import { VG_Transition_Constraint } from './VG_Transition_Constraint';
import { VG_Transition } from './VG_Transition';
import { VG_Node } from './VG_Node';
import { ContextActionType } from './ContextActions';
import { Abstract_PT_Node, PT_Element } from '../ParsingTree';
import { ComplexTreeLayout } from './treeLayout/ComplexTreeLayout';
import { TL_Literal, TL_Loop, TL_LoopBound, TL_Or, TreeLayout } from './treeLayout/TreeLayout';

export interface ValidationState {
	active: boolean;
	currentInputIndex: number;
	context: ValidationContext;
	currentContextStack: (string | number)[];
	failure: ValidationFailure | undefined;
	nodeStates: number[];
}

export interface ValidationFailure {
	ptElement: PT_Element;
	loopCount: number;
	violatedConstraints: ValidationConstraint[];
}

export interface ValidationConstraint {
	transitionConstraint: VG_Transition_Constraint | undefined;
	loopBound: TL_LoopBound;
}

export type ValidationContext = Record<string, ValidationContextEntry<PT_Element> | ValidationContext[]>;

export interface ValidationContextEntry<T extends PT_Element> {
	element: T;
	inputIndex: number;
}

export function hasContextEntry(context: ValidationContext, key: string): boolean {
	return context[key] !== undefined && typeof context[key] === 'object' && !Array.isArray(context);
}

export function hasContextSubContext(context: ValidationContext, key: string): boolean {
	return context[key] !== undefined && typeof context[key] === 'object' && Array.isArray(context);
}

export function getEntryFromContext<T extends PT_Element>(context: ValidationContext, key: string): ValidationContextEntry<T> {
	return context[key] as ValidationContextEntry<T>;
}

export function getSubContextArrayFromContext(context: ValidationContext, key: string): ValidationContext[] {
	return context[key] as ValidationContext[];
}

export function cloneValidationContext(context: ValidationContext): ValidationContext {
	const newContext: ValidationContext = {};

	for (const contextKey in context) {
		const el = context[contextKey];

		if (Array.isArray(el)) {
			newContext[contextKey] = el.map(x => cloneValidationContext(x));
		} else {
			newContext[contextKey] = {
				element: el.element,
				inputIndex: el.inputIndex,
			};
		}
	}

	return newContext;
}

export class ValidationGraph {
	layout: TreeLayout;
	nodes: VG_Node[];
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

	public validateParsingTree(astNode: Abstract_PT_Node): boolean {
		const valRes = this.validateParsingTreeAndExtractContext(astNode);
		return valRes.acceptedState !== undefined;
	}

	public validateParsingTreeAndExtractContext(astNode: Abstract_PT_Node): { acceptedState: ValidationState | undefined; allStates: ValidationState[] } {
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

		// TODO: make this +1 better
		for (let astIndex = 0; astIndex < astNode.children.length + 1; astIndex++) {
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
							const newContext: ValidationContext = cloneValidationContext(validationState.context);
							const newContextStack: (string | number)[] = [...validationState.currentContextStack];
							let currentContext: ValidationContext = traverseObjectByPath(newContextStack as string[], newContext);
							// console.log(currentContext);

							// do the current key first
							if (transition.key !== undefined) {
								currentContext[transition.key] = { element: astChild, inputIndex: astIndex };
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

									const subContextArray: ValidationContext[] = currentContext[contextAction.key] as ValidationContext[];
									const newSubContext: ValidationContext = {};

									subContextArray.push(newSubContext);
									newContextStack.push(contextAction.key);
									newContextStack.push(subContextArray.length - 1);
									currentContext = newSubContext;
								}
							}

							newStates.push({
								active: true,
								currentInputIndex: transition.constraint !== undefined ? astIndex : validationState.currentInputIndex,
								context: newContext,
								currentContextStack: newContextStack,
								failure: undefined,
								nodeStates: validationState.nodeStates.concat([transition.to]),
							});

							allTransitionsFailed = false;
						} else {
							violatedConstraints.push({
								transitionConstraint: transition.constraint,
								loopBound: transition.loopBound,
							});
						}
					}

					// console.log(currentState, node.transitions, violatedConstraints, newStates);

					if (astChild === undefined && node.transitions.length === 0) {
						newStates.push({
							active: true,
							currentInputIndex: astIndex,
							context: validationState.context,
							currentContextStack: validationState.currentContextStack,
							failure: undefined,
							nodeStates: validationState.nodeStates,
						});

						allTransitionsFailed = false;
					}

					if (allTransitionsFailed) {
						// console.log('all transitions failed', node.transitions, node, astIndex, validationState);

						// TODO: maybe modify the object instead of creating a new one.
						newStates.push({
							active: false,
							context: validationState.context,
							currentInputIndex: astIndex,
							currentContextStack: validationState.currentContextStack,
							failure: {
								ptElement: astChild,
								loopCount: loopCount,
								violatedConstraints: violatedConstraints,
							},
							nodeStates: validationState.nodeStates,
						});
					}
				}

				// console.log(newStates);

				this.state = newStates;
			}
		}

		// console.log('parsing state');
		// console.log(this.state);

		const validResults = this.state.filter(x => {
			if (!x.active) {
				return false;
			}

			const lastNode = this.getNode(x.nodeStates[x.nodeStates.length - 1]);
			return lastNode ? lastNode.final : false;
		});

		// console.log(validResults);

		if (validResults.length === 0) {
			return {
				acceptedState: undefined,
				allStates: this.state,
			};
		} else if (validResults.length === 1) {
			return {
				acceptedState: validResults[0],
				allStates: this.state,
			};
		} else {
			throw new Error('more than one valid paths');
		}
	}

	private hasUnfinishedStates(states: ValidationState[], astIndex: number): boolean {
		for (const state of states) {
			if (state.active && state.currentInputIndex !== astIndex) {
				return true;
			}
		}

		return false;
	}
}

import { traverseObjectByPath } from '@opd-libs/opd-utils-lib/lib/ObjectTraversalUtils';
import { VG_Transition_Constraint } from './VG_Transition_Constraint';
import { VG_Transition } from './VG_Transition';
import { VG_Node } from './VG_Node';
import { ContextActionType } from './ContextActions';
import { Abstract_PT_Node, PT_Closure, PT_Element, PT_Element_Type, PT_Literal } from '../ParsingTree';
import { ComplexTreeLayout } from './treeLayout/ComplexTreeLayout';
import { TL_Literal, TL_Loop, TL_LoopBound, TL_Or, TreeLayout } from './treeLayout/TreeLayout';
import { ParsingError } from '../ParsingError';
import { ErrorLevel, MetaBindParsingError } from '../../../utils/errors/MetaBindErrors';
import { AbstractToken, createToken, EOF_TOKEN } from '../ParsingUtils';

export interface ValidationState<TokenType extends string, Token extends AbstractToken<TokenType>, Key extends string> {
	active: boolean;
	currentInputIndex: number;
	context: ValidationContext<TokenType, Token, Key>;
	currentContextStack: (string | number)[];
	failure: ValidationFailure<TokenType, Token> | undefined;
	nodeStates: number[];
}

export type ValidationResult<TokenType extends string, Token extends AbstractToken<TokenType>, Key extends string> =
	| { acceptedState: ValidationState<TokenType, Token, Key>; validationError: undefined }
	| { acceptedState: undefined; validationError: ParsingError };

export interface ValidationFailure<TokenType extends string, Token extends AbstractToken<TokenType>> {
	ptElement: PT_Element<TokenType, Token> | undefined;
	loopCount: number;
	violatedConstraints: ValidationConstraint<TokenType, Token>[];
}

export interface ValidationConstraint<TokenType extends string, Token extends AbstractToken<TokenType>> {
	transitionConstraint: VG_Transition_Constraint<TokenType, Token> | undefined;
	loopBound: TL_LoopBound;
}

export type ValidationContext<TokenType extends string, Token extends AbstractToken<TokenType>, Key extends string> = Partial<
	Record<Key, ValidationContextEntry<TokenType, Token, PT_Element<TokenType, Token>> | ValidationContext<TokenType, Token, Key>[]>
>;

export interface ValidationContextEntry<TokenType extends string, Token extends AbstractToken<TokenType>, Element extends PT_Element<TokenType, Token>> {
	element: Element;
	inputIndex: number;
}

export function hasContextEntry<TokenType extends string, Token extends AbstractToken<TokenType>, Key extends string>(
	context: ValidationContext<TokenType, Token, Key>,
	key: Key
): boolean {
	return context[key] !== undefined && typeof context[key] === 'object' && !Array.isArray(context);
}

export function hasContextSubContext<TokenType extends string, Token extends AbstractToken<TokenType>, Key extends string>(
	context: ValidationContext<TokenType, Token, Key>,
	key: Key
): boolean {
	return context[key] !== undefined && typeof context[key] === 'object' && Array.isArray(context);
}

export function getEntryFromContext<TokenType extends string, Token extends AbstractToken<TokenType>, Key extends string>(
	context: ValidationContext<TokenType, Token, Key>,
	key: Key
): ValidationContextEntry<TokenType, Token, PT_Element<TokenType, Token>> {
	const el = context[key];
	if (el === undefined) {
		throw new MetaBindParsingError(ErrorLevel.ERROR, 'can not get key from context', 'key does not exist in context');
	}
	if (Array.isArray(el)) {
		throw new MetaBindParsingError(ErrorLevel.ERROR, 'can not get key from context', 'key points to a sub context');
	}
	return el;
}

export function getClosureFromContext<TokenType extends string, Token extends AbstractToken<TokenType>, Key extends string>(
	context: ValidationContext<TokenType, Token, Key>,
	key: Key
): ValidationContextEntry<TokenType, Token, PT_Closure<TokenType, Token>> {
	const el = context[key];
	if (el === undefined) {
		throw new MetaBindParsingError(ErrorLevel.ERROR, 'can not get key from context', 'key does not exist in context');
	}
	if (Array.isArray(el)) {
		throw new MetaBindParsingError(ErrorLevel.ERROR, 'can not get key from context', 'key points to a sub context');
	}
	if (!(el.element instanceof PT_Closure<TokenType, Token>)) {
		throw new MetaBindParsingError(ErrorLevel.ERROR, 'can not get key from context', 'key does not point to a PT_Literal');
	}
	// ts somehow cant infer this, so the cast is needed
	return el as ValidationContextEntry<TokenType, Token, PT_Closure<TokenType, Token>>;
}

export function getLiteralFromContext<TokenType extends string, Token extends AbstractToken<TokenType>, Key extends string>(
	context: ValidationContext<TokenType, Token, Key>,
	key: Key
): ValidationContextEntry<TokenType, Token, PT_Literal<TokenType, Token>> {
	const el = context[key];
	if (el === undefined) {
		throw new MetaBindParsingError(ErrorLevel.ERROR, 'can not get key from context', 'key does not exist in context');
	}
	if (Array.isArray(el)) {
		throw new MetaBindParsingError(ErrorLevel.ERROR, 'can not get key from context', 'key points to a sub context');
	}
	if (!(el.element instanceof PT_Literal<TokenType, Token>)) {
		throw new MetaBindParsingError(ErrorLevel.ERROR, 'can not get key from context', 'key does not point to a PT_Literal');
	}
	// ts somehow cant infer this, so the cast is needed
	return el as ValidationContextEntry<TokenType, Token, PT_Literal<TokenType, Token>>;
}

export function getClosureOrUndefinedFromContext<TokenType extends string, Token extends AbstractToken<TokenType>, Key extends string>(
	context: ValidationContext<TokenType, Token, Key>,
	key: Key
): ValidationContextEntry<TokenType, Token, PT_Closure<TokenType, Token>> | undefined {
	const el = context[key];
	if (el === undefined) {
		return undefined;
	}
	if (Array.isArray(el)) {
		throw new MetaBindParsingError(ErrorLevel.ERROR, 'can not get key from context', 'key points to a sub context');
	}
	if (!(el.element instanceof PT_Closure<TokenType, Token>)) {
		throw new MetaBindParsingError(ErrorLevel.ERROR, 'can not get key from context', 'key does not point to a PT_Literal');
	}
	// ts somehow cant infer this, so the cast is needed
	return el as ValidationContextEntry<TokenType, Token, PT_Closure<TokenType, Token>>;
}

export function getLiteralOrUndefinedFromContext<TokenType extends string, Token extends AbstractToken<TokenType>, Key extends string>(
	context: ValidationContext<TokenType, Token, Key>,
	key: Key
): ValidationContextEntry<TokenType, Token, PT_Literal<TokenType, Token>> | undefined {
	const el = context[key];
	if (el === undefined) {
		return undefined;
	}
	if (Array.isArray(el)) {
		throw new MetaBindParsingError(ErrorLevel.ERROR, 'can not get key from context', 'key points to a sub context');
	}
	if (!(el.element instanceof PT_Literal<TokenType, Token>)) {
		throw new MetaBindParsingError(ErrorLevel.ERROR, 'can not get key from context', 'key does not point to a PT_Literal');
	}
	// ts somehow cant infer this, so the cast is needed
	return el as ValidationContextEntry<TokenType, Token, PT_Literal<TokenType, Token>>;
}

export function getSubContextArrayFromContext<TokenType extends string, Token extends AbstractToken<TokenType>, Key1 extends string, Key2 extends Key1>(
	context: ValidationContext<TokenType, Token, Key1>,
	key: Key2
): ValidationContext<TokenType, Token, Key1>[] {
	const el = context[key];
	if (el === undefined) {
		throw new MetaBindParsingError(ErrorLevel.ERROR, 'can not get key from context', 'key does not exist in context');
	}
	if (!Array.isArray(el)) {
		throw new MetaBindParsingError(ErrorLevel.ERROR, 'can not get key from context', 'key points to a context entry');
	}
	return el;
}

export function cloneValidationContext<TokenType extends string, Token extends AbstractToken<TokenType>, Key extends string>(
	context: ValidationContext<TokenType, Token, Key>
): ValidationContext<TokenType, Token, Key> {
	const newContext: ValidationContext<TokenType, Token, Key> = {};

	for (const contextKey in context) {
		const el = context[contextKey];

		if (el === undefined) {
			continue;
		}

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

export class ValidationGraph<TokenType extends string, Token extends AbstractToken<TokenType>, Key extends string> {
	layout: TreeLayout<TokenType, Token, Key>;
	nodes: VG_Node<TokenType, Token, Key>[];
	state: ValidationState<TokenType, Token, Key>[];
	private nodeIndexCounter: number;

	constructor(treeLayout: ComplexTreeLayout<TokenType, Token, Key>) {
		this.layout = treeLayout.map(x => x.toTL());
		// console.log(this.layout);
		this.nodes = [];
		this.state = [];
		this.nodeIndexCounter = 0;

		this.nodes.push(new VG_Node(-1, undefined));

		this.parseTreeLayout(this.layout, this.nodes[0]);

		const endNodeTransitionConstraint: VG_Transition_Constraint<TokenType, Token> = new VG_Transition_Constraint(
			PT_Element_Type.LITERAL,
			EOF_TOKEN as TokenType
		);
		const endNode: VG_Node<TokenType, Token, Key> = new VG_Node(this.nodeIndexCounter, endNodeTransitionConstraint, true);
		this.nodeIndexCounter += 1;
		this.nodes[this.nodes.length - 1].createTransition(endNode.index, endNodeTransitionConstraint, undefined, undefined, undefined);
		this.nodes.push(endNode);

		// this.nodes[this.nodes.length - 1].final = true;
	}

	private parseTreeLayout(
		treeLayout: TreeLayout<TokenType, Token, Key>,
		previousNode: VG_Node<TokenType, Token, Key>
	): { first: VG_Node<TokenType, Token, Key>; last: VG_Node<TokenType, Token, Key> } {
		let firstNode: VG_Node<TokenType, Token, Key> | undefined;
		let lastNode: VG_Node<TokenType, Token, Key> | undefined;

		for (let i = 0; i < treeLayout.length; i++) {
			const currentLayout = treeLayout[i];

			if (currentLayout instanceof TL_Loop) {
				// create an empty node before the loop
				const emptyNodePre: VG_Node<TokenType, Token, Key> = new VG_Node(this.nodeIndexCounter, undefined);
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
				const emptyNodePost: VG_Node<TokenType, Token, Key> = new VG_Node(this.nodeIndexCounter, undefined);
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
				if (currentLayout.bound.min === 0 || currentLayout.bound.min === -1) {
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
				const emptyNodePre: VG_Node<TokenType, Token, Key> = new VG_Node(this.nodeIndexCounter, undefined);
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
				const emptyNodePost: VG_Node<TokenType, Token, Key> = new VG_Node(this.nodeIndexCounter, undefined);
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
				const currentNode: VG_Node<TokenType, Token, Key> = new VG_Node(this.nodeIndexCounter, currentLayout.constraint);
				this.nodeIndexCounter += 1;
				this.nodes.push(currentNode);

				// console.log('current layout key', currentLayout.key);

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
				const emptyNode: VG_Node<TokenType, Token, Key> = new VG_Node(this.nodeIndexCounter, undefined);
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

	public optimize(): void {
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
					const transitionIndex = incomingTransition.node.transitions.indexOf(incomingTransition.transition);
					incomingTransition.node.transitions.splice(transitionIndex, 1);

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

		const newNodes: VG_Node<TokenType, Token, Key>[] = [];

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

	private getIncomingTransitions(
		node: VG_Node<TokenType, Token, Key>
	): { transition: VG_Transition<TokenType, Token, Key>; node: VG_Node<TokenType, Token, Key> }[] {
		const transitions: { transition: VG_Transition<TokenType, Token, Key>; node: VG_Node<TokenType, Token, Key> }[] = [];

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

	public getNode(index: number): VG_Node<TokenType, Token, Key> | undefined {
		return this.nodes.find(x => x.index === index);
	}

	public validateParsingTree(astNode: Abstract_PT_Node<TokenType, Token>): boolean {
		const valRes = this.validateParsingTreeAndExtractContext(astNode);
		return valRes.acceptedState !== undefined;
	}

	public validateParsingTreeAndExtractContext(ptNode: Abstract_PT_Node<TokenType, Token>): ValidationResult<TokenType, Token, Key> {
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

		let eofToken: AbstractToken<typeof EOF_TOKEN> | undefined;

		// TODO: make this +1 better
		for (let ptIndex = 0; ptIndex < ptNode.children.length + 1; ptIndex++) {
			let ptChild: PT_Element<TokenType, Token>;

			if (ptIndex === ptNode.children.length) {
				const prevChild = ptNode.children[ptIndex - 1];
				const eofTokenPos = prevChild !== undefined ? prevChild.getRange().to + 1 : ptNode.getRange().to;
				eofToken = createToken(EOF_TOKEN, 'eof', eofTokenPos, eofTokenPos);

				ptChild = new PT_Literal(eofToken as Token, '');
			} else {
				ptChild = ptNode.children[ptIndex];
			}

			while (this.hasUnfinishedStates(this.state, ptIndex)) {
				this.validateParsingTreeChild(ptChild, ptIndex);
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

		// console.log(validResults);

		if (validResults.length === 0) {
			// TODO: calculate the closest path and generate an error based on it

			const pathsAtEndOfInput = this.state.filter(x => x.currentInputIndex === ptNode.children.length);

			let violatedTransitions: VG_Transition<TokenType, Token, Key>[] = [];
			let receivedToken: AbstractToken<TokenType>;

			if (pathsAtEndOfInput.length > 0) {
				// case 1: the path has reached the final input, but not a final state

				for (const path of pathsAtEndOfInput) {
					const node = this.getNode(path.nodeStates[path.nodeStates.length - 1]);

					if (node === undefined) {
						throw new Error('This parser sucks');
					}

					violatedTransitions = violatedTransitions.concat(node.transitions);
				}

				if (eofToken === undefined) {
					throw new Error('This parser sucks');
				}

				receivedToken = eofToken as Token;
			} else {
				// case 2: the path has not reached the end of the input

				// find the paths that got the furthest

				let furthestInputIndex = 0;
				let furthestPaths: ValidationState<TokenType, Token, Key>[] = [];

				for (const path of this.state) {
					if (path.currentInputIndex === furthestInputIndex) {
						furthestPaths.push(path);
					} else if (path.currentInputIndex > furthestInputIndex) {
						furthestInputIndex = path.currentInputIndex;
						furthestPaths = [];
						furthestPaths.push(path);
					}
				}

				for (const path of furthestPaths) {
					const node = this.getNode(path.nodeStates[path.nodeStates.length - 1]);

					if (node === undefined) {
						throw new Error('This parser sucks');
					}

					violatedTransitions = violatedTransitions.concat(node.transitions);
				}

				receivedToken = ptNode.children[furthestInputIndex].getToken();
			}

			console.log(ptNode);

			return {
				acceptedState: undefined,
				validationError: new ParsingError(
					ErrorLevel.ERROR,
					'failed to parse',
					`Encountered invalid token. Received '${receivedToken.literal}' expected token to be one of: ${violatedTransitions
						.map(x => `[${x.constraint?.toString()}]`)
						.join(', ')}`,
					{},
					ptNode.str,
					receivedToken,
					'Validation Graph'
				),
			};
		} else if (validResults.length === 1) {
			return {
				acceptedState: validResults[0],
				validationError: undefined,
			};
		} else {
			throw new Error('more than one valid paths');
		}
	}

	private validateParsingTreeChild(ptChild: PT_Element<TokenType, Token>, ptIndex: number): void {
		const newStates: ValidationState<TokenType, Token, Key>[] = [];

		for (const validationState of this.state) {
			if (!validationState.active || validationState.currentInputIndex === ptIndex) {
				newStates.push(validationState);
				continue;
			}

			const currentState = validationState.nodeStates[validationState.nodeStates.length - 1];
			const node = this.getNode(currentState);
			if (!node) {
				throw new Error('this parser sucks');
			}

			// count the occurrences of the node in the validation state
			let loopCount = 0;
			for (const nodeState of validationState.nodeStates) {
				if (nodeState === node.index) {
					loopCount += 1;
				}
			}

			const violatedConstraints: ValidationConstraint<TokenType, Token>[] = [];
			let allTransitionsFailed = true;

			for (const transition of node.transitions) {
				if (transition.canTransition(ptChild, loopCount)) {
					let contextEntry = undefined;
					if (ptChild !== undefined) {
						contextEntry = {
							element: ptChild,
							inputIndex: ptIndex,
						};
					}

					const newContext = this.updateContext(validationState, transition, contextEntry);

					newStates.push({
						active: true,
						currentInputIndex: transition.constraint !== undefined ? ptIndex : validationState.currentInputIndex,
						context: newContext.context,
						currentContextStack: newContext.contextStack,
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

			if (allTransitionsFailed) {
				newStates.push({
					active: false,
					context: validationState.context,
					currentInputIndex: ptIndex,
					currentContextStack: validationState.currentContextStack,
					failure: {
						ptElement: ptChild,
						loopCount: loopCount,
						violatedConstraints: violatedConstraints,
					},
					nodeStates: validationState.nodeStates,
				});
			}
		}

		this.state = newStates;
	}

	private updateContext(
		validationState: ValidationState<TokenType, Token, Key>,
		transition: VG_Transition<TokenType, Token, Key>,
		contextEntry: ValidationContextEntry<TokenType, Token, PT_Element<TokenType, Token>> | undefined
	): { context: ValidationContext<TokenType, Token, Key>; contextStack: (string | number)[] } {
		const newContext: ValidationContext<TokenType, Token, Key> = cloneValidationContext(validationState.context);
		const newContextStack: (string | number)[] = [...validationState.currentContextStack];

		let currentContext: ValidationContext<TokenType, Token, Key> = traverseObjectByPath(newContextStack as string[], newContext);

		// do the current key first
		if (transition.key !== undefined && contextEntry !== undefined) {
			currentContext[transition.key] = contextEntry;
		}

		// do context actions
		for (const contextAction of transition.contextActions) {
			if (contextAction.type === ContextActionType.POP) {
				newContextStack.pop();
				newContextStack.pop();
				currentContext = traverseObjectByPath(newContextStack as string[], newContext);
			} else {
				if (currentContext[contextAction.key] === undefined) {
					currentContext[contextAction.key] = [] as ValidationContext<TokenType, Token, Key>[];
				}

				const subContextArray: ValidationContext<TokenType, Token, Key>[] = currentContext[contextAction.key] as ValidationContext<
					TokenType,
					Token,
					Key
				>[];
				const newSubContext: ValidationContext<TokenType, Token, Key> = {};

				subContextArray.push(newSubContext);
				newContextStack.push(contextAction.key);
				newContextStack.push(subContextArray.length - 1);
				currentContext = newSubContext;
			}
		}

		return {
			context: newContext,
			contextStack: newContextStack,
		};
	}

	private hasUnfinishedStates(states: ValidationState<TokenType, Token, Key>[], astIndex: number): boolean {
		for (const state of states) {
			if (state.active && state.currentInputIndex !== astIndex) {
				return true;
			}
		}

		return false;
	}
}

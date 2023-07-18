import { Abstract_AST_Node, AST_El_Type } from './InputFieldParser';

export enum TreeLayoutType {
	LOOP = 'LOOP',
	OR = 'OR',
	LITERAL = 'LITERAL',
}

export class TreeLayoutLoop {
	type: TreeLayoutType;
	loop: TreeLayout;
	min: number;
	max: number;

	constructor(loop: TreeLayout, min: number, max: number) {
		this.type = TreeLayoutType.LOOP;

		this.loop = loop;
		this.min = min;
		this.max = max;
	}
}

export class TreeLayoutOr {
	type: TreeLayoutType;
	option1: TreeLayout;
	option2: TreeLayout;
	allowNone: boolean;

	constructor(option1: TreeLayout, option2: TreeLayout, allowNone: boolean = false) {
		this.type = TreeLayoutType.OR;

		this.option1 = option1;
		this.option2 = option2;
		this.allowNone = allowNone;
	}
}

export type TreeLayout = (AST_El_Type | TreeLayoutLoop | TreeLayoutOr)[];

export class ValidationGraphTransition {
	from: number;
	to: number;
	input: AST_El_Type;
	loopMin: number;
	loopMax: number;

	constructor(from: number, to: number, input: AST_El_Type, loopMin: number, loopMax: number) {
		this.from = from;
		this.to = to;
		this.input = input;
		this.loopMin = loopMin;
		this.loopMax = loopMax;
	}
}

export class ValidationGraphNode {
	index: number;
	treeNode: AST_El_Type;
	final: boolean;
	loopMin: number;
	loopMax: number;
	transitions: ValidationGraphTransition[];

	constructor(index: number, treeNode: AST_El_Type, final: boolean = false, loopMin: number = -1, loopMax: number = -1) {
		this.index = index;
		this.treeNode = treeNode;
		this.final = final;
		this.loopMin = loopMin;
		this.loopMax = loopMax;
		this.transitions = [];
	}

	public createTransition(to: number, input: AST_El_Type, loopMin: number = -1, loopMax: number = -1): void {
		this.transitions.push(new ValidationGraphTransition(this.index, to, input, loopMin, loopMax));
	}
}

// export class ValidationGraphLoopNode extends ValidationGraphNode {
// 	constructor(index: number[]) {
// 		super(index);
// 	}
//
// 	createTransition(to: number[], input: AST_El_Type, loopMin: number, loopMax: number) {}
// }

type GraphNode = ValidationGraphNode; //| ValidationGraphLoopNode;

interface ValidationState {
	nodeState: number[];
}

export class ValidationGraph {
	layout: TreeLayout;
	nodes: GraphNode[];
	state: ValidationState[];
	private nodeIndexCounter: number;

	constructor(treeLayout: TreeLayout) {
		this.layout = treeLayout;
		this.nodes = [];
		this.state = [];
		this.nodeIndexCounter = 0;

		this.nodes.push(new ValidationGraphNode(-1, AST_El_Type.SPECIAL_START));

		this.parseTreeLayout(treeLayout, this.nodes[0]);

		const endNode = new ValidationGraphNode(this.nodeIndexCounter, AST_El_Type.SPECIAL_END);
		this.nodeIndexCounter += 1;
		this.nodes[this.nodes.length - 1].createTransition(endNode.index, AST_El_Type.SPECIAL_END);
		this.nodes.push(endNode);

		this.nodes[this.nodes.length - 1].final = true;
	}

	private parseTreeLayout(treeLayout: TreeLayout, previousNode: ValidationGraphNode): { first: ValidationGraphNode; last: ValidationGraphNode } {
		let firstNode: ValidationGraphNode | undefined;
		let lastNode: ValidationGraphNode | undefined;

		for (let i = 0; i < treeLayout.length; i++) {
			const currentLayout = treeLayout[i];

			if (typeof currentLayout === 'object') {
				if (currentLayout instanceof TreeLayoutLoop) {
					const res = this.parseTreeLayout(currentLayout.loop, previousNode);

					if (currentLayout.min === 0) {
						res.last.loopMin = 1;

						previousNode.createTransition(res.last.index, AST_El_Type.NONE);
					} else {
						res.last.loopMin = currentLayout.min;
					}

					res.last.loopMax = currentLayout.max;

					res.last.createTransition(res.first.index, res.first.treeNode, -1, res.last.loopMax);

					if (!firstNode) {
						firstNode = res.first;
					}

					if (i === treeLayout.length - 1) {
						lastNode = res.last;
					}

					previousNode = res.last;
				} else {
					const emptyNodePre = new ValidationGraphNode(this.nodeIndexCounter, AST_El_Type.NONE);
					this.nodeIndexCounter += 1;
					this.nodes.push(emptyNodePre);

					previousNode.createTransition(emptyNodePre.index, AST_El_Type.NONE);

					const res1 = this.parseTreeLayout(currentLayout.option1, emptyNodePre);
					const res2 = this.parseTreeLayout(currentLayout.option2, emptyNodePre);

					const emptyNodePost = new ValidationGraphNode(this.nodeIndexCounter, AST_El_Type.NONE);
					this.nodeIndexCounter += 1;
					this.nodes.push(emptyNodePost);

					res1.last.createTransition(emptyNodePost.index, AST_El_Type.NONE);
					res2.last.createTransition(emptyNodePost.index, AST_El_Type.NONE);

					if (currentLayout.allowNone) {
						emptyNodePre.createTransition(emptyNodePost.index, AST_El_Type.NONE);
					}

					if (!firstNode) {
						firstNode = emptyNodePre;
					}

					if (i === treeLayout.length - 1) {
						lastNode = emptyNodePost;
					}

					previousNode = emptyNodePost;
				}
			} else {
				const currentNode = new ValidationGraphNode(this.nodeIndexCounter, currentLayout);
				this.nodeIndexCounter += 1;
				this.nodes.push(currentNode);

				previousNode.createTransition(currentNode.index, currentLayout, previousNode.loopMin, -1);

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
				const emptyNode = new ValidationGraphNode(this.nodeIndexCounter, AST_El_Type.NONE);
				this.nodeIndexCounter += 1;
				this.nodes.push(emptyNode);

				previousNode.createTransition(emptyNode.index, AST_El_Type.NONE);

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

	public getNode(index: number): ValidationGraphNode | undefined {
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

		for (const type of astElTypes) {
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
					if (transition.input === type) {
						if ((transition.loopMin === -1 || nodeCount >= transition.loopMin) && (transition.loopMax === -1 || nodeCount < transition.loopMax)) {
							newStates.push({
								nodeState: validationState.nodeState.concat([transition.to]),
							});
						}
					}
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
	private preprocessTransitions(transitions: ValidationGraphTransition[]): ValidationGraphTransition[] {
		let newTransitions: ValidationGraphTransition[] = [];

		for (const transition of transitions) {
			if (transition.input === AST_El_Type.NONE) {
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

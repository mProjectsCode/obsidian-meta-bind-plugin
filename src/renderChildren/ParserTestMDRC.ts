import { AbstractMDRC } from './AbstractMDRC';
import { loadMermaid } from 'obsidian';
import {
	ComplexTreeLayout,
	ContextActionType,
	TL_C_Literal,
	TL_C_Loop,
	TL_C_Optional,
	TL_C_Or,
	ValidationGraph,
} from '../parsers/newInputFieldParser/TreeValidator';
import { AST_El_Type, InputFieldASTParser, InputFieldTokenizer, InputFieldTokenType } from '../parsers/newInputFieldParser/InputFieldParser';

export class ParserTestMDRC extends AbstractMDRC {
	mermaid: any;

	public async onload(): Promise<void> {
		this.containerEl.empty();

		this.mermaid = await loadMermaid();

		// const layoutValidationGraph = new ValidationGraph([
		// 	new TL_C_Literal(AST_El_Type.LITERAL, InputFieldTokenType.WORD), // input field type
		// 	new TL_C_Optional([new TL_C_Literal(AST_El_Type.CLOSURE, InputFieldTokenType.L_PAREN)]), // optional arguments
		// 	new TL_C_Optional([
		// 		new TL_C_Literal(AST_El_Type.LITERAL, InputFieldTokenType.COLON), // bind target separator
		// 		new TL_C_Optional([
		// 			new TL_C_Literal(AST_El_Type.LITERAL, InputFieldTokenType.WORD), // file
		// 			new TL_C_Literal(AST_El_Type.LITERAL, InputFieldTokenType.HASHTAG), // hashtag
		// 		]), // optional file and hashtag
		// 		new TL_C_Literal(AST_El_Type.LITERAL, InputFieldTokenType.WORD), // first bind target metadata path part
		// 		new TL_C_Loop(
		// 			[
		// 				new TL_C_Or([new TL_C_Literal(AST_El_Type.LITERAL)], [new TL_C_Literal(AST_El_Type.CLOSURE)]), // either literal or closure or none, in a loop
		// 			],
		// 			0,
		// 			-1
		// 		), // the other bind target metadata path part
		// 	]),
		// ]);
		//
		// this.containerEl.innerHTML += await this.mermaid.render('test', this.graphToString(layoutValidationGraph));
		// layoutValidationGraph.optimizeParsingGraph();
		// this.containerEl.innerHTML += await this.mermaid.render('test2', this.graphToString(layoutValidationGraph));

		// await this.renderGraph(
		// 	'loop bound -1',
		// 	[new TL_C_Literal(AST_El_Type.LITERAL), new TL_C_Loop([new TL_C_Literal(AST_El_Type.CLOSURE)], -1, 3), new TL_C_Literal(AST_El_Type.LITERAL)],
		// 	false
		// );
		//
		// await this.renderGraph(
		// 	'loop bound 0',
		// 	[new TL_C_Literal(AST_El_Type.LITERAL), new TL_C_Loop([new TL_C_Literal(AST_El_Type.CLOSURE)], 0, 3), new TL_C_Literal(AST_El_Type.LITERAL)],
		// 	false
		// );
		//
		// await this.renderGraph(
		// 	'loop bound 2 -1',
		// 	[
		// 		new TL_C_Literal(AST_El_Type.LITERAL),
		// 		new TL_C_Loop([new TL_C_Literal(AST_El_Type.CLOSURE), new TL_C_Literal(AST_El_Type.CLOSURE)], -1, 3),
		// 		new TL_C_Literal(AST_El_Type.LITERAL),
		// 	],
		// 	false
		// );
		//
		// await this.renderGraph(
		// 	'loop bound 2 0',
		// 	[
		// 		new TL_C_Literal(AST_El_Type.LITERAL, undefined, undefined, 'pre'),
		// 		new TL_C_Loop(
		// 			[new TL_C_Literal(AST_El_Type.CLOSURE, undefined, undefined, 'l1'), new TL_C_Literal(AST_El_Type.CLOSURE, undefined, undefined, 'l2')],
		// 			2,
		// 			3,
		// 			'loop'
		// 		),
		// 		new TL_C_Literal(AST_El_Type.LITERAL, undefined, undefined, 'post'),
		// 	],
		// 	true,
		// 	'a()[][]()b'
		// );

		await this.renderGraph(
			'inputField',
			[
				new TL_C_Literal(AST_El_Type.LITERAL, InputFieldTokenType.WORD, undefined, 'inputFieldType'), // input field type
				new TL_C_Optional([new TL_C_Literal(AST_El_Type.CLOSURE, InputFieldTokenType.L_PAREN, undefined, 'arguments')]), // optional arguments
				new TL_C_Optional([
					new TL_C_Literal(AST_El_Type.LITERAL, InputFieldTokenType.COLON), // bind target separator
					new TL_C_Optional([
						new TL_C_Literal(AST_El_Type.LITERAL, InputFieldTokenType.WORD, undefined, 'bindTargetFile'), // file
						new TL_C_Literal(AST_El_Type.LITERAL, InputFieldTokenType.HASHTAG), // hashtag
					]), // optional file and hashtag
					new TL_C_Literal(AST_El_Type.LITERAL, InputFieldTokenType.WORD, undefined, 'bindTarget'), // first bind target metadata path part
					new TL_C_Loop(
						[
							new TL_C_Or([[new TL_C_Literal(AST_El_Type.LITERAL)], [new TL_C_Literal(AST_El_Type.CLOSURE)]]), // either literal or closure or none, in a loop
						],
						0,
						-1
					), // the other bind target metadata path part
				]),
			],
			true,
			'toggle(a, b, c(d)):e'
		);

		// const fullDeclaration = 'test(a):b';
		//
		// const tokenizer = new InputFieldTokenizer(fullDeclaration);
		// const tokens = tokenizer.getTokens();
		// const astParser = new InputFieldASTParser(fullDeclaration, tokens);
		// const ast = astParser.parse();
		//
		// layoutValidationGraph.validateAST(ast);
	}

	async renderGraph(name: string, treeLayout: ComplexTreeLayout, renderOptimized: boolean, testString?: string | undefined): Promise<void> {
		const graph = new ValidationGraph(treeLayout);

		this.containerEl.createEl('h3', { text: name });

		const graphEl = this.containerEl.createEl('div');
		graphEl.innerHTML = await this.mermaid.render(this.slugifyName(name), this.graphToString(graph));

		if (renderOptimized) {
			let optimizedName = name + ' optimized';

			this.containerEl.createEl('h3', { text: optimizedName });

			const graphEl2 = this.containerEl.createEl('div');
			graph.optimizeParsingGraph();
			graphEl2.innerHTML = await this.mermaid.render(this.slugifyName(optimizedName), this.graphToString(graph));
		}

		if (testString !== undefined) {
			const tokenizer = new InputFieldTokenizer(testString);
			const tokens = tokenizer.getTokens();
			const astParser = new InputFieldASTParser(testString, tokens);
			const ast = astParser.parse();

			graph.validateAST(ast);
		}
	}

	slugifyName(name: string): string {
		return name.replaceAll(' ', '_');
	}

	graphToString(graph: ValidationGraph): string {
		let graphString = graph.nodes
			.map(x => {
				return x.transitions.map(x => {
					let ret = '';

					if (x.from === -1) {
						ret += `start --> s${x.to}`;
					} else {
						ret += `s${x.from} --> s${x.to}`;
					}

					let label = '';

					if (x.constraint) {
						label += `${x.constraint.toString().replaceAll(':', 'colon')}`;
					}

					label += `[${x.loopBound.min}, ${x.loopBound.max}]`;

					if (x.key) {
						label += `(${x.key})`;
					}

					for (const contextAction of x.contextActions) {
						if (contextAction.type === ContextActionType.PUSH) {
							label += `(${contextAction.type}, ${contextAction.key})`;
						} else {
							label += `(${contextAction.type})`;
						}
					}

					return label ? ret + ' : ' + label : ret;
				});
			})
			.reduce((previousValue, currentValue) => previousValue.concat(currentValue), [])
			.join('\n');

		console.log(graphString);

		graphString +=
			'\n\n' +
			graph.nodes
				.filter(x => x.final)
				.map(x => `class ${x.index !== -1 ? `s${x.index}` : 'start'} final`)
				.join('\n');

		console.log(graphString);

		return `stateDiagram-v2\nclassDef final stroke:white\n${graphString}`;
	}
}
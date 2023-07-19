import { AbstractMDRC } from './AbstractMDRC';
import { loadMermaid } from 'obsidian';
import { TL_C_Literal, TL_C_Loop, TL_C_Optional, TL_C_Or, ValidationGraph } from '../parsers/newInputFieldParser/TreeValidator';
import { AST_El_Type, InputFieldTokenType } from '../parsers/newInputFieldParser/InputFieldParser';

export class ParserTestMDRC extends AbstractMDRC {
	public async onload(): Promise<void> {
		this.containerEl.empty();

		const layoutValidationGraph = new ValidationGraph([
			new TL_C_Literal(AST_El_Type.LITERAL, InputFieldTokenType.WORD), // input field type
			new TL_C_Optional([new TL_C_Literal(AST_El_Type.CLOSURE, InputFieldTokenType.L_PAREN)]), // optional arguments
			new TL_C_Optional([
				new TL_C_Literal(AST_El_Type.LITERAL, InputFieldTokenType.COLON), // bind target separator
				new TL_C_Optional([
					new TL_C_Literal(AST_El_Type.LITERAL, InputFieldTokenType.WORD), // file
					new TL_C_Literal(AST_El_Type.LITERAL, InputFieldTokenType.HASHTAG), // hashtag
				]), // optional file and hashtag
				new TL_C_Literal(AST_El_Type.LITERAL, InputFieldTokenType.WORD), // first bind target metadata path part
				new TL_C_Loop(
					[
						new TL_C_Or([new TL_C_Literal(AST_El_Type.LITERAL)], [new TL_C_Literal(AST_El_Type.CLOSURE)]), // either literal or closure or none, in a loop
					],
					0,
					-1
				), // the other bind target metadata path part
			]),
		]);

		const mermaid = await loadMermaid();
		this.containerEl.innerHTML += await mermaid.render('test', this.graphToString(layoutValidationGraph));
		layoutValidationGraph.optimizeParsingGraph();
		this.containerEl.innerHTML += await mermaid.render('test2', this.graphToString(layoutValidationGraph));
	}

	graphToString(graph: ValidationGraph): string {
		let graphString = graph.nodes
			.map(x => {
				return x.transitions.map(x => {
					let ret = '';

					if (x.from === -1) {
						if (x.isEmpty()) {
							ret += `start --> s${x.to}`;
						} else {
							ret += `start --> s${x.to}: ${x.constraint?.toString().replaceAll(':', 'colon')}`;
						}
					} else {
						if (x.isEmpty()) {
							ret += `s${x.from} --> s${x.to}`;
						} else {
							ret += `s${x.from} --> s${x.to}: ${x.constraint?.toString().replaceAll(':', 'colon')}`;
						}
					}

					return ret;
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

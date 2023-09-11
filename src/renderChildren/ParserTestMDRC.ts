import { AbstractMDRC } from './AbstractMDRC';
// import { loadMermaid } from 'obsidian';
// import { InputFieldParsingTreeParser } from '../parsers/newInputFieldParser/InputFieldParsingTreeParser';
// import { RenderChildType } from './InputFieldMDRC';
// import MetaBindPlugin from '../main';
// import { ValidationGraph } from '../parsers/generalParser/validationGraph/ValidationGraph';
// import { AbstractToken } from '../parsers/generalParser/ParsingUtils';
// import { InputFieldTokenizer } from '../parsers/newInputFieldParser/InputFieldTokenizer';
// import { ContextActionType } from '../parsers/generalParser/validationGraph/ContextActions';
//
// export class ParserTestMDRC extends AbstractMDRC {
// 	mermaid: any;
// 	content: string;
//
// 	constructor(
// 		containerEl: HTMLElement,
// 		renderChildType: RenderChildType,
// 		content: string,
// 		plugin: MetaBindPlugin,
// 		filePath: string,
// 		uuid: string,
// 		frontmatter: any
// 	) {
// 		super(containerEl, renderChildType, plugin, filePath, uuid, frontmatter);
//
// 		this.content = content.replaceAll('\n', '').replaceAll(' ', '');
// 	}
//
// 	public async onload(): Promise<void> {
// 		this.containerEl.empty();
//
// 		this.mermaid = await loadMermaid();
//
// 		// @ts-ignore
// 		const graph: ValidationGraph<string, AbstractToken<string>, string> = this.plugin.api.newInputFieldParser.graphSupplier[this.content];
//
// 		if (graph === undefined) {
// 			this.containerEl.createSpan({ text: `Invalid graph name '${this.content}'`, cls: 'meta-bind-error' });
// 		} else {
// 			await this.renderGraph(this.content, graph);
// 		}
// 	}
//
// 	async renderGraph(name: string, graph: ValidationGraph<string, AbstractToken<string>, string>, testString?: string | undefined): Promise<void> {
// 		this.containerEl.createEl('h3', { text: name });
//
// 		const graphEl = this.containerEl.createEl('div');
// 		graphEl.innerHTML = (await this.mermaid.render(this.slugifyName(name), this.graphToString(graph))).svg;
//
// 		if (testString !== undefined) {
// 			const tokenizer = new InputFieldTokenizer(testString);
// 			const tokens = tokenizer.getTokens();
// 			const astParser = new InputFieldParsingTreeParser(testString, tokens);
// 			const ast = astParser.parse();
//
// 			console.log(graph.validateParsingTreeAndExtractContext(ast));
// 		}
// 	}
//
// 	slugifyName(name: string): string {
// 		return name.replaceAll(' ', '_');
// 	}
//
// 	graphToString(graph: ValidationGraph<string, AbstractToken<string>, string>): string {
// 		let graphString = graph.nodes
// 			.map(x => {
// 				return x.transitions.map(x => {
// 					let ret = '';
//
// 					if (x.from === -1) {
// 						ret += `start --> s${x.to}`;
// 					} else {
// 						ret += `s${x.from} --> s${x.to}`;
// 					}
//
// 					let label = '';
//
// 					if (x.constraint) {
// 						label += `${x.constraint.toString().replaceAll(':', 'colon')} `;
// 					}
//
// 					if (x.loopBound.min !== -1 || x.loopBound.max !== -1) {
// 						label += `[${x.loopBound.min}, ${x.loopBound.max}]`;
// 					}
//
// 					if (x.key) {
// 						label += `(${x.key})`;
// 					}
//
// 					for (const contextAction of x.contextActions) {
// 						if (contextAction.type === ContextActionType.PUSH) {
// 							label += `(${contextAction.type}, ${contextAction.key})`;
// 						} else {
// 							label += `(${contextAction.type})`;
// 						}
// 					}
//
// 					return label ? ret + ' : ' + label : ret;
// 				});
// 			})
// 			.reduce((previousValue, currentValue) => previousValue.concat(currentValue), [])
// 			.join('\n');
//
// 		console.log(graphString);
//
// 		graphString +=
// 			'\n\n' +
// 			graph.nodes
// 				.filter(x => x.final)
// 				.map(x => `class ${x.index !== -1 ? `s${x.index}` : 'start'} final`)
// 				.join('\n');
//
// 		console.log(graphString);
//
// 		return `stateDiagram-v2\nclassDef final stroke:white\n${graphString}`;
// 	}
// }

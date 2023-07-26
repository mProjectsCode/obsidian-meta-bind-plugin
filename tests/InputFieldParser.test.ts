import { InputFieldParsingTreeParser } from '../src/parsers/newInputFieldParser/InputFieldParsingTreeParser';
import { InputFieldTokenizer } from '../src/parsers/newInputFieldParser/InputFieldTokenizer';
import { ValidationGraph } from '../src/parsers/newInputFieldParser/validationGraph/ValidationGraph';
import { ParsingTree, PT_Element_Type } from '../src/parsers/newInputFieldParser/ParsingTree';
import { TL_C_Literal, TL_C_Or } from '../src/parsers/newInputFieldParser/validationGraph/treeLayout/ComplexTreeLayout';

describe('tokenizer tests', function () {
	test('tokenize all simple tokens', () => {
		const input = '()[]:#,.';
		const tokenizer = new InputFieldTokenizer(input);
		const tokens = tokenizer.getTokens();
		expect(tokens).toMatchSnapshot();
	});

	test('tokenize simple word', () => {
		const input = 'hello world';
		const tokenizer = new InputFieldTokenizer(input);
		const tokens = tokenizer.getTokens();
		expect(tokens).toMatchSnapshot();
	});

	test('tokenize simple mix of tokens and words', () => {
		const input = 'hello world(this is a message to all people)';
		const tokenizer = new InputFieldTokenizer(input);
		const tokens = tokenizer.getTokens();
		expect(tokens).toMatchSnapshot();
	});

	test('tokenize simple quotes', () => {
		const input = "'hello world(this is a message to all people)'";
		const tokenizer = new InputFieldTokenizer(input);
		const tokens = tokenizer.getTokens();
		expect(tokens).toMatchSnapshot();
	});

	test('tokenize complex quotes', () => {
		const input = "hello world('this is a message to all people []' test [] ':')";
		const tokenizer = new InputFieldTokenizer(input);
		const tokens = tokenizer.getTokens();
		expect(tokens).toMatchSnapshot();
	});
});

describe('ast parser tests', function () {
	test('simple closure test', () => {
		const input = 'hello world(this is a message to all people)';
		const tokenizer = new InputFieldTokenizer(input);
		const tokens = tokenizer.getTokens();
		const astParser = new InputFieldParsingTreeParser(input, tokens);
		const ast = astParser.parse();
		expect(ast).toMatchSnapshot();
	});

	test('complex closure test 2', () => {
		const input = 'hello world[this is a message to all people]test(a)b';
		const tokenizer = new InputFieldTokenizer(input);
		const tokens = tokenizer.getTokens();
		const astParser = new InputFieldParsingTreeParser(input, tokens);
		const ast = astParser.parse();
		console.log(ast.toDebugString());
		expect(ast).toMatchSnapshot();
	});

	test('unclosed closure test', () => {
		const input = 'hello world[this is a message to all (people]test)b';
		const tokenizer = new InputFieldTokenizer(input);
		const tokens = tokenizer.getTokens();
		const astParser = new InputFieldParsingTreeParser(input, tokens);
		expect(() => astParser.parse()).toThrowErrorMatchingSnapshot();
	});

	test('simple input field declaration 1', () => {
		const input = "INPUT[text:nested['object']]";
		const tokenizer = new InputFieldTokenizer(input);
		const tokens = tokenizer.getTokens();
		const astParser = new InputFieldParsingTreeParser(input, tokens);
		const ast = astParser.parse();
		expect(ast).toMatchSnapshot();
	});
});

describe('tree validation tests', function () {
	function createParsingTree(str: string): ParsingTree {
		const tokenizer = new InputFieldTokenizer(str);
		const tokens = tokenizer.getTokens();
		const astParser = new InputFieldParsingTreeParser(str, tokens);
		return astParser.parse();
	}

	test('validation graph test 1', () => {
		const graph = new ValidationGraph([
			new TL_C_Literal(PT_Element_Type.CLOSURE),
			new TL_C_Literal(PT_Element_Type.LITERAL),
			new TL_C_Literal(PT_Element_Type.CLOSURE),
		]);

		expect(graph.validateParsingTree(createParsingTree('()a[]'))).toEqual(true);

		expect(graph.validateParsingTree(createParsingTree('()a[]b'))).toEqual(false);
		expect(graph.validateParsingTree(createParsingTree('()[]'))).toEqual(false);
		expect(graph.validateParsingTree(createParsingTree('()'))).toEqual(false);
		expect(graph.validateParsingTree(createParsingTree(''))).toEqual(false);
	});

	test('validation graph test 2', () => {
		const graph = new ValidationGraph([
			new TL_C_Literal(PT_Element_Type.CLOSURE),
			new TL_C_Or([[], [new TL_C_Literal(PT_Element_Type.LITERAL)]]),
			new TL_C_Literal(PT_Element_Type.CLOSURE),
		]);

		expect(graph.validateParsingTree(createParsingTree('()a[]'))).toEqual(true);
		expect(graph.validateParsingTree(createParsingTree('()[]'))).toEqual(true);

		expect(graph.validateParsingTree(createParsingTree('()a[]b'))).toEqual(false);
		expect(graph.validateParsingTree(createParsingTree('()'))).toEqual(false);
		expect(graph.validateParsingTree(createParsingTree(''))).toEqual(false);
	});

	test('validation graph test 3', () => {
		const graph = new ValidationGraph([
			new TL_C_Literal(PT_Element_Type.CLOSURE),
			new TL_C_Or([[new TL_C_Or([[], [new TL_C_Literal(PT_Element_Type.LITERAL)]])], [new TL_C_Or([[], [new TL_C_Literal(PT_Element_Type.CLOSURE)]])]]),
			new TL_C_Literal(PT_Element_Type.CLOSURE),
		]);

		expect(graph.validateParsingTree(createParsingTree('()a[]'))).toEqual(true);
		expect(graph.validateParsingTree(createParsingTree('()[]'))).toEqual(true);
		expect(graph.validateParsingTree(createParsingTree('()()[]'))).toEqual(true);

		expect(graph.validateParsingTree(createParsingTree('()a[]b'))).toEqual(false);
		expect(graph.validateParsingTree(createParsingTree('()'))).toEqual(false);
		expect(graph.validateParsingTree(createParsingTree(''))).toEqual(false);
	});

	test('validation graph test 4', () => {
		const graph = new ValidationGraph([
			new TL_C_Literal(PT_Element_Type.CLOSURE),
			new TL_C_Or([[], [new TL_C_Literal(PT_Element_Type.LITERAL)], [new TL_C_Literal(PT_Element_Type.CLOSURE)]]),
			new TL_C_Literal(PT_Element_Type.CLOSURE),
		]);

		expect(graph.validateParsingTree(createParsingTree('()a[]'))).toEqual(true);
		expect(graph.validateParsingTree(createParsingTree('()()[]'))).toEqual(true);
		expect(graph.validateParsingTree(createParsingTree('()[]'))).toEqual(true);

		expect(graph.validateParsingTree(createParsingTree('()a[]b'))).toEqual(false);
		expect(graph.validateParsingTree(createParsingTree('()'))).toEqual(false);
		expect(graph.validateParsingTree(createParsingTree(''))).toEqual(false);
	});

	test('validation graph test 5', () => {
		const graph = new ValidationGraph([
			new TL_C_Literal(PT_Element_Type.CLOSURE),
			new TL_C_Or([[], [new TL_C_Literal(PT_Element_Type.LITERAL)]]),
			new TL_C_Or([[], [new TL_C_Literal(PT_Element_Type.CLOSURE)]]),
			new TL_C_Literal(PT_Element_Type.CLOSURE),
		]);

		expect(graph.validateParsingTree(createParsingTree('()a()[]'))).toEqual(true);
		expect(graph.validateParsingTree(createParsingTree('()a[]'))).toEqual(true);
		expect(graph.validateParsingTree(createParsingTree('()()[]'))).toEqual(true);
		expect(graph.validateParsingTree(createParsingTree('()[]'))).toEqual(true);

		expect(graph.validateParsingTree(createParsingTree('()a[]b'))).toEqual(false);
		expect(graph.validateParsingTree(createParsingTree('()'))).toEqual(false);
		expect(graph.validateParsingTree(createParsingTree(''))).toEqual(false);
	});
});
// describe('validation tree test', function () {
// 	// 	test('simple construct validation graph 1', () => {
// 	// 		const graph = new ValidationGraph([AST_El_Type.CLOSURE, { loop: [AST_El_Type.LITERAL], min: 1, max: 3 }, AST_El_Type.CLOSURE]);
// 	//
// 	// 		expect(graph).toMatchSnapshot();
// 	// 	});
// 	//
// 	// 	test('simple construct validation graph 2', () => {
// 	// 		const graph = new ValidationGraph([
// 	// 			AST_El_Type.CLOSURE,
// 	// 			{ loop: [AST_El_Type.LITERAL], min: 0, max: 3 },
// 	// 			{ loop: [AST_El_Type.CLOSURE], min: 0, max: 3 },
// 	// 			AST_El_Type.CLOSURE,
// 	// 		]);
// 	//
// 	// 		expect(graph).toMatchSnapshot();
// 	// 	});
// 	//
// 	// 	test('simple construct validation graph 3', () => {
// 	// 		const graph = new ValidationGraph([AST_El_Type.CLOSURE, { loop: [AST_El_Type.CLOSURE, AST_El_Type.LITERAL], min: 0, max: 3 }, AST_El_Type.CLOSURE]);
// 	//
// 	// 		expect(graph).toMatchSnapshot();
// 	// 	});
// 	//
// 	// 	test('simple construct validation graph 4', () => {
// 	// 		const graph = new ValidationGraph([AST_El_Type.CLOSURE, { loop: [AST_El_Type.CLOSURE, AST_El_Type.LITERAL], min: 0, max: 1 }, AST_El_Type.CLOSURE]);
// 	//
// 	// 		expect(graph).toMatchSnapshot();
// 	// 	});
//
// 	test('simple construct validation graph 5', () => {
// 		const graph = new ValidationGraph([AST_El_Type.CLOSURE, new TL_Or([], [AST_El_Type.LITERAL]), AST_El_Type.CLOSURE]);
//
// 		expect(graph).toMatchSnapshot();
// 	});
//
// 	test('simple construct validation graph 6', () => {
// 		const graph = new ValidationGraph([
// 			AST_El_Type.CLOSURE,
// 			new TL_Or([new TL_Or([], [AST_El_Type.LITERAL])], [new TL_Or([], [AST_El_Type.CLOSURE])]),
// 			AST_El_Type.CLOSURE,
// 		]);
//
// 		expect(graph).toMatchSnapshot();
// 	});
// });

import { AST_El_Type, InputFieldASTParser, InputFieldTokenizer } from '../src/parsers/newInputFieldParser/InputFieldParser';
import { TreeLayoutOr, ValidationGraph } from '../src/parsers/newInputFieldParser/TreeValidator';

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
		const input = '"hello world(this is a message to all people)"';
		const tokenizer = new InputFieldTokenizer(input);
		const tokens = tokenizer.getTokens();
		expect(tokens).toMatchSnapshot();
	});

	test('tokenize complex quotes', () => {
		const input = 'hello world("this is a message to all people []" test [] ":")';
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
		const astParser = new InputFieldASTParser(input, tokens);
		const ast = astParser.parse();
		expect(ast).toMatchSnapshot();
	});

	test('complex closure test 2', () => {
		const input = 'hello world[this is a message to all people]test(a)b';
		const tokenizer = new InputFieldTokenizer(input);
		const tokens = tokenizer.getTokens();
		const astParser = new InputFieldASTParser(input, tokens);
		const ast = astParser.parse();
		console.log(ast.toDebugString());
		expect(ast).toMatchSnapshot();
	});

	test('unclosed closure test', () => {
		const input = 'hello world[this is a message to all (people]test)b';
		const tokenizer = new InputFieldTokenizer(input);
		const tokens = tokenizer.getTokens();
		const astParser = new InputFieldASTParser(input, tokens);
		expect(() => astParser.parse()).toThrowErrorMatchingSnapshot();
	});

	test('simple input field declaration 1', () => {
		const input = 'INPUT[text:nested["object"]]';
		const tokenizer = new InputFieldTokenizer(input);
		const tokens = tokenizer.getTokens();
		const astParser = new InputFieldASTParser(input, tokens);
		const ast = astParser.parse();
		console.log(ast.toDebugString());
		expect(ast).toMatchSnapshot();
	});
});

describe('tree validation tests', function () {
	test('placeholder', () => {
		expect(true).toEqual(true);
	});

	// 	test('simple closure test 1', () => {
	// 		const input = '(a)b:c(d)';
	// 		const tokenizer = new InputFieldTokenizer(input);
	// 		const tokens = tokenizer.getTokens();
	// 		const astParser = new InputFieldASTParser(input, tokens);
	// 		const ast = astParser.parse();
	// 		const graph = new ValidationGraph([AST_El_Type.CLOSURE, { loop: [AST_El_Type.LITERAL], min: 1, max: 3 }, AST_El_Type.CLOSURE]);
	//
	// 		expect(graph.validateAST(ast)).toEqual(true);
	// 	});
	//
	// 	test('simple closure test 2', () => {
	// 		const input = '(a)b:(c)';
	// 		const tokenizer = new InputFieldTokenizer(input);
	// 		const tokens = tokenizer.getTokens();
	// 		const astParser = new InputFieldASTParser(input, tokens);
	// 		const ast = astParser.parse();
	// 		const graph = new ValidationGraph([AST_El_Type.CLOSURE, { loop: [AST_El_Type.LITERAL], min: 1, max: 3 }, AST_El_Type.CLOSURE]);
	//
	// 		expect(graph.validateAST(ast)).toEqual(true);
	// 	});
	//
	// 	test('simple closure test 3', () => {
	// 		const input = '(a)b(c)';
	// 		const tokenizer = new InputFieldTokenizer(input);
	// 		const tokens = tokenizer.getTokens();
	// 		const astParser = new InputFieldASTParser(input, tokens);
	// 		const ast = astParser.parse();
	// 		const graph = new ValidationGraph([AST_El_Type.CLOSURE, { loop: [AST_El_Type.LITERAL], min: 1, max: 3 }, AST_El_Type.CLOSURE]);
	//
	// 		expect(graph.validateAST(ast)).toEqual(true);
	// 	});
	//
	// 	test('simple closure test 4', () => {
	// 		const input = '(a)b:c:d(e)';
	// 		const tokenizer = new InputFieldTokenizer(input);
	// 		const tokens = tokenizer.getTokens();
	// 		const astParser = new InputFieldASTParser(input, tokens);
	// 		const ast = astParser.parse();
	// 		const graph = new ValidationGraph([AST_El_Type.CLOSURE, { loop: [AST_El_Type.LITERAL], min: 1, max: 3 }, AST_El_Type.CLOSURE]);
	//
	// 		expect(graph.validateAST(ast)).toEqual(false);
	// 	});
	//
	// 	test('simple closure test 5', () => {
	// 		const input = '(a)b:c:(e)';
	// 		const tokenizer = new InputFieldTokenizer(input);
	// 		const tokens = tokenizer.getTokens();
	// 		const astParser = new InputFieldASTParser(input, tokens);
	// 		const ast = astParser.parse();
	// 		const graph = new ValidationGraph([AST_El_Type.CLOSURE, { loop: [AST_El_Type.LITERAL], min: 0, max: 3 }, AST_El_Type.LITERAL, AST_El_Type.CLOSURE]);
	//
	// 		expect(graph.validateAST(ast)).toEqual(true);
	// 	});
	//
	// 	test('simple closure test 6', () => {
	// 		const input = '(a)b:c:(d)e:g:(g)';
	// 		const tokenizer = new InputFieldTokenizer(input);
	// 		const tokens = tokenizer.getTokens();
	// 		const astParser = new InputFieldASTParser(input, tokens);
	// 		const ast = astParser.parse();
	// 		const graph = new ValidationGraph([
	// 			AST_El_Type.CLOSURE,
	// 			{ loop: [AST_El_Type.LITERAL], min: 2, max: 3 },
	// 			AST_El_Type.CLOSURE,
	// 			{ loop: [AST_El_Type.LITERAL], min: 4, max: 6 },
	// 			AST_El_Type.CLOSURE,
	// 		]);
	//
	// 		expect(graph.validateAST(ast)).toEqual(false);
	// 	});
	//
	// 	test('simple closure test 7', () => {
	// 		const input = '(a)b:c(e)(e)(e)';
	// 		const tokenizer = new InputFieldTokenizer(input);
	// 		const tokens = tokenizer.getTokens();
	// 		const astParser = new InputFieldASTParser(input, tokens);
	// 		const ast = astParser.parse();
	// 		const graph = new ValidationGraph([
	// 			AST_El_Type.CLOSURE,
	// 			{ loop: [AST_El_Type.LITERAL], min: 0, max: 3 },
	// 			{ loop: [AST_El_Type.CLOSURE], min: 0, max: 3 },
	// 			AST_El_Type.CLOSURE,
	// 		]);
	//
	// 		expect(graph.validateAST(ast)).toEqual(true);
	// 	});

	test('simple closure test 8', () => {
		const input = '(a)b(c)';
		const tokenizer = new InputFieldTokenizer(input);
		const tokens = tokenizer.getTokens();
		const astParser = new InputFieldASTParser(input, tokens);
		const ast = astParser.parse();
		const graph = new ValidationGraph([AST_El_Type.CLOSURE, new TreeLayoutOr([], [AST_El_Type.LITERAL]), AST_El_Type.CLOSURE]);

		expect(graph.validateAST(ast)).toEqual(true);
	});

	test('simple closure test 9', () => {
		const input = '(a)(c)';
		const tokenizer = new InputFieldTokenizer(input);
		const tokens = tokenizer.getTokens();
		const astParser = new InputFieldASTParser(input, tokens);
		const ast = astParser.parse();
		const graph = new ValidationGraph([AST_El_Type.CLOSURE, new TreeLayoutOr([], [AST_El_Type.LITERAL]), AST_El_Type.CLOSURE]);

		expect(graph.validateAST(ast)).toEqual(true);
	});

	test('simple closure test 10', () => {
		const input = '(a)(c)';
		const tokenizer = new InputFieldTokenizer(input);
		const tokens = tokenizer.getTokens();
		const astParser = new InputFieldASTParser(input, tokens);
		const ast = astParser.parse();
		const graph = new ValidationGraph([AST_El_Type.CLOSURE, new TreeLayoutOr([], [AST_El_Type.LITERAL]), AST_El_Type.CLOSURE]);

		expect(graph.validateAST(ast)).toEqual(true);
	});

	test('simple closure test 11', () => {
		const input = '(a)(c)';
		const tokenizer = new InputFieldTokenizer(input);
		const tokens = tokenizer.getTokens();
		const astParser = new InputFieldASTParser(input, tokens);
		const ast = astParser.parse();
		const graph = new ValidationGraph([
			AST_El_Type.CLOSURE,
			new TreeLayoutOr([new TreeLayoutOr([], [AST_El_Type.LITERAL])], [new TreeLayoutOr([], [AST_El_Type.CLOSURE])]),
			AST_El_Type.CLOSURE,
		]);

		expect(graph.validateAST(ast)).toEqual(true);
	});

	test('simple closure test 12', () => {
		const input = '(a)a(c)';
		const tokenizer = new InputFieldTokenizer(input);
		const tokens = tokenizer.getTokens();
		const astParser = new InputFieldASTParser(input, tokens);
		const ast = astParser.parse();
		const graph = new ValidationGraph([
			AST_El_Type.CLOSURE,
			new TreeLayoutOr([new TreeLayoutOr([], [AST_El_Type.LITERAL])], [new TreeLayoutOr([], [AST_El_Type.CLOSURE])]),
			AST_El_Type.CLOSURE,
		]);

		expect(graph.validateAST(ast)).toEqual(true);
	});

	test('simple closure test 13', () => {
		const input = '(a)[](c)';
		const tokenizer = new InputFieldTokenizer(input);
		const tokens = tokenizer.getTokens();
		const astParser = new InputFieldASTParser(input, tokens);
		const ast = astParser.parse();
		const graph = new ValidationGraph([
			AST_El_Type.CLOSURE,
			new TreeLayoutOr([new TreeLayoutOr([], [AST_El_Type.LITERAL])], [new TreeLayoutOr([], [AST_El_Type.CLOSURE])]),
			AST_El_Type.CLOSURE,
		]);

		expect(graph.validateAST(ast)).toEqual(true);
	});

	test('simple closure test 14', () => {
		const input = '(a)a[](c)';
		const tokenizer = new InputFieldTokenizer(input);
		const tokens = tokenizer.getTokens();
		const astParser = new InputFieldASTParser(input, tokens);
		const ast = astParser.parse();
		const graph = new ValidationGraph([
			AST_El_Type.CLOSURE,
			new TreeLayoutOr([new TreeLayoutOr([], [AST_El_Type.LITERAL])], [new TreeLayoutOr([], [AST_El_Type.CLOSURE])]),
			AST_El_Type.CLOSURE,
		]);

		expect(graph.validateAST(ast)).toEqual(false);
	});

	test('simple closure test 15', () => {
		const input = '(a)(c)';
		const tokenizer = new InputFieldTokenizer(input);
		const tokens = tokenizer.getTokens();
		const astParser = new InputFieldASTParser(input, tokens);
		const ast = astParser.parse();
		const graph = new ValidationGraph([AST_El_Type.CLOSURE, new TreeLayoutOr([], [AST_El_Type.LITERAL]), new TreeLayoutOr([], [AST_El_Type.CLOSURE]), AST_El_Type.CLOSURE]);

		expect(graph.validateAST(ast)).toEqual(true);
	});

	test('simple closure test 16', () => {
		const input = '(a)a(c)';
		const tokenizer = new InputFieldTokenizer(input);
		const tokens = tokenizer.getTokens();
		const astParser = new InputFieldASTParser(input, tokens);
		const ast = astParser.parse();
		const graph = new ValidationGraph([AST_El_Type.CLOSURE, new TreeLayoutOr([], [AST_El_Type.LITERAL]), new TreeLayoutOr([], [AST_El_Type.CLOSURE]), AST_El_Type.CLOSURE]);

		expect(graph.validateAST(ast)).toEqual(true);
	});

	test('simple closure test 17', () => {
		const input = '(a)[](c)';
		const tokenizer = new InputFieldTokenizer(input);
		const tokens = tokenizer.getTokens();
		const astParser = new InputFieldASTParser(input, tokens);
		const ast = astParser.parse();
		const graph = new ValidationGraph([AST_El_Type.CLOSURE, new TreeLayoutOr([], [AST_El_Type.LITERAL]), new TreeLayoutOr([], [AST_El_Type.CLOSURE]), AST_El_Type.CLOSURE]);

		expect(graph.validateAST(ast)).toEqual(true);
	});

	test('simple closure test 18', () => {
		const input = '(a)a[](c)';
		const tokenizer = new InputFieldTokenizer(input);
		const tokens = tokenizer.getTokens();
		const astParser = new InputFieldASTParser(input, tokens);
		const ast = astParser.parse();
		const graph = new ValidationGraph([AST_El_Type.CLOSURE, new TreeLayoutOr([], [AST_El_Type.LITERAL]), new TreeLayoutOr([], [AST_El_Type.CLOSURE]), AST_El_Type.CLOSURE]);

		expect(graph.validateAST(ast)).toEqual(true);
	});
});
describe('validation tree test', function () {
	// 	test('simple construct validation graph 1', () => {
	// 		const graph = new ValidationGraph([AST_El_Type.CLOSURE, { loop: [AST_El_Type.LITERAL], min: 1, max: 3 }, AST_El_Type.CLOSURE]);
	//
	// 		expect(graph).toMatchSnapshot();
	// 	});
	//
	// 	test('simple construct validation graph 2', () => {
	// 		const graph = new ValidationGraph([
	// 			AST_El_Type.CLOSURE,
	// 			{ loop: [AST_El_Type.LITERAL], min: 0, max: 3 },
	// 			{ loop: [AST_El_Type.CLOSURE], min: 0, max: 3 },
	// 			AST_El_Type.CLOSURE,
	// 		]);
	//
	// 		expect(graph).toMatchSnapshot();
	// 	});
	//
	// 	test('simple construct validation graph 3', () => {
	// 		const graph = new ValidationGraph([AST_El_Type.CLOSURE, { loop: [AST_El_Type.CLOSURE, AST_El_Type.LITERAL], min: 0, max: 3 }, AST_El_Type.CLOSURE]);
	//
	// 		expect(graph).toMatchSnapshot();
	// 	});
	//
	// 	test('simple construct validation graph 4', () => {
	// 		const graph = new ValidationGraph([AST_El_Type.CLOSURE, { loop: [AST_El_Type.CLOSURE, AST_El_Type.LITERAL], min: 0, max: 1 }, AST_El_Type.CLOSURE]);
	//
	// 		expect(graph).toMatchSnapshot();
	// 	});

	test('simple construct validation graph 5', () => {
		const graph = new ValidationGraph([AST_El_Type.CLOSURE, new TreeLayoutOr([], [AST_El_Type.LITERAL]), AST_El_Type.CLOSURE]);

		expect(graph).toMatchSnapshot();
	});

	test('simple construct validation graph 6', () => {
		const graph = new ValidationGraph([
			AST_El_Type.CLOSURE,
			new TreeLayoutOr([new TreeLayoutOr([], [AST_El_Type.LITERAL])], [new TreeLayoutOr([], [AST_El_Type.CLOSURE])]),
			AST_El_Type.CLOSURE,
		]);

		expect(graph).toMatchSnapshot();
	});
});

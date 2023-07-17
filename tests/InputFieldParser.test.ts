import { AST_El_Type, InputFieldASTParser, InputFieldTokenizer } from '../src/parsers/newInputFieldParser/InputFieldParser';

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
	test('simple closure test 1', () => {
		const input = '(a)b:c(d)';
		const tokenizer = new InputFieldTokenizer(input);
		const tokens = tokenizer.getTokens();
		const astParser = new InputFieldASTParser(input, tokens);
		const ast = astParser.parse();

		expect(ast.test([AST_El_Type.CLOSURE, { layout: [AST_El_Type.LITERAL], min: 1, max: 3 }, AST_El_Type.CLOSURE])).toEqual(true);
	});

	test('simple closure test 2', () => {
		const input = '(a)b:(c)';
		const tokenizer = new InputFieldTokenizer(input);
		const tokens = tokenizer.getTokens();
		const astParser = new InputFieldASTParser(input, tokens);
		const ast = astParser.parse();

		expect(ast.test([AST_El_Type.CLOSURE, { layout: [AST_El_Type.LITERAL], min: 1, max: 3 }, AST_El_Type.CLOSURE])).toEqual(true);
	});

	test('simple closure test 3', () => {
		const input = '(a)b(c)';
		const tokenizer = new InputFieldTokenizer(input);
		const tokens = tokenizer.getTokens();
		const astParser = new InputFieldASTParser(input, tokens);
		const ast = astParser.parse();

		expect(ast.test([AST_El_Type.CLOSURE, { layout: [AST_El_Type.LITERAL], min: 1, max: 3 }, AST_El_Type.CLOSURE])).toEqual(true);
	});

	test('simple closure test 4', () => {
		const input = '(a)b:c:d(e)';
		const tokenizer = new InputFieldTokenizer(input);
		const tokens = tokenizer.getTokens();
		const astParser = new InputFieldASTParser(input, tokens);
		const ast = astParser.parse();

		expect(ast.test([AST_El_Type.CLOSURE, { layout: [AST_El_Type.LITERAL], min: 1, max: 3 }, AST_El_Type.CLOSURE])).toEqual(false);
	});

	test('simple closure test 5', () => {
		const input = '(a)b:c:(e)';
		const tokenizer = new InputFieldTokenizer(input);
		const tokens = tokenizer.getTokens();
		const astParser = new InputFieldASTParser(input, tokens);
		const ast = astParser.parse();

		expect(ast.test([AST_El_Type.CLOSURE, { layout: [AST_El_Type.LITERAL], min: 0, max: 3 }, AST_El_Type.LITERAL, AST_El_Type.CLOSURE])).toEqual(true);
	});

	test('simple closure test 6', () => {
		const input = '(a)b:c(d)e:g:(g)';
		const tokenizer = new InputFieldTokenizer(input);
		const tokens = tokenizer.getTokens();
		const astParser = new InputFieldASTParser(input, tokens);
		const ast = astParser.parse();

		expect(
			ast.test([
				AST_El_Type.CLOSURE,
				{ layout: [AST_El_Type.LITERAL], min: 0, max: 3 },
				AST_El_Type.CLOSURE,
				{ layout: [AST_El_Type.LITERAL], min: 0, max: 4 },
				AST_El_Type.CLOSURE,
			])
		).toEqual(true);
	});

	test('simple closure test 7', () => {
		const input = '(a)b:c(e)(e)(e)';
		const tokenizer = new InputFieldTokenizer(input);
		const tokens = tokenizer.getTokens();
		const astParser = new InputFieldASTParser(input, tokens);
		const ast = astParser.parse();

		expect(ast.test([AST_El_Type.CLOSURE, { layout: [AST_El_Type.LITERAL], min: 0, max: 3 }, { layout: [AST_El_Type.CLOSURE], min: 0, max: 3 }, AST_El_Type.CLOSURE])).toEqual(
			true
		);
	});
});

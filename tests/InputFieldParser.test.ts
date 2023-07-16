import { InputFieldASTParser, InputFieldTokenizer } from '../src/parsers/newInputFieldParser/InputFieldParser';

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

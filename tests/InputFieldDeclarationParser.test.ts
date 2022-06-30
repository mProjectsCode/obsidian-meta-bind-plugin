import {InputFieldDeclaration, InputFieldDeclarationParser, InputFieldType} from '../src/parsers/InputFieldDeclarationParser';

test('placeholder', () => {
	expect(true).toEqual(true);
});

describe('bind target', () => {
	test('no bind target', () => {
		const declaration: string = 'INPUT[toggle]';
		const inputFieldDeclaration: InputFieldDeclaration = InputFieldDeclarationParser.parse(declaration);

		expect(inputFieldDeclaration.isBound).toEqual(false);
		expect(inputFieldDeclaration.bindTarget).toEqual('');
	});

	test('same file bind target', () => {
		const declaration: string = 'INPUT[toggle:target]';
		const inputFieldDeclaration: InputFieldDeclaration = InputFieldDeclarationParser.parse(declaration);

		expect(inputFieldDeclaration.isBound).toEqual(true);
		expect(inputFieldDeclaration.bindTarget).toEqual('target');
	});

	test('other file bind target', () => {
		const declaration: string = 'INPUT[toggle:file#target]';
		const inputFieldDeclaration: InputFieldDeclaration = InputFieldDeclarationParser.parse(declaration);

		expect(inputFieldDeclaration.isBound).toEqual(true);
		expect(inputFieldDeclaration.bindTarget).toEqual('file#target');
	});

	test('other file bind target path', () => {
		const declaration: string = 'INPUT[toggle:path/to/file#target]';
		const inputFieldDeclaration: InputFieldDeclaration = InputFieldDeclarationParser.parse(declaration);

		expect(inputFieldDeclaration.isBound).toEqual(true);
		expect(inputFieldDeclaration.bindTarget).toEqual('path/to/file#target');
	});
});

describe('input type', () => {
	describe('all input types', () => {
		for (const entry of Object.entries(InputFieldType)) {
			if (entry[1] === 'invalid') {
				continue;
			}
			test(`${entry[1]} input type`, () => {
				const declaration: string = `INPUT[${entry[1]}:target]`;
				const inputFieldDeclaration: InputFieldDeclaration = InputFieldDeclarationParser.parse(declaration);

				expect(inputFieldDeclaration.inputFieldType).toEqual(entry[1]);
			});
		}
	});

	test('input type with parentheses', () => {
		const declaration: string = 'INPUT[toggle()]';
		const inputFieldDeclaration: InputFieldDeclaration = InputFieldDeclarationParser.parse(declaration);

		expect(inputFieldDeclaration.inputFieldType).toEqual('toggle');
	});

	test('input type with arguments', () => {
		const declaration: string = 'INPUT[toggle(class(a))]';
		const inputFieldDeclaration: InputFieldDeclaration = InputFieldDeclarationParser.parse(declaration);

		expect(inputFieldDeclaration.inputFieldType).toEqual('toggle');
	});

	test('input type with arguments and bind target', () => {
		const declaration: string = 'INPUT[toggle(class(a)):file#target]';
		const inputFieldDeclaration: InputFieldDeclaration = InputFieldDeclarationParser.parse(declaration);

		expect(inputFieldDeclaration.inputFieldType).toEqual('toggle');
	});
});

// TODO: tests here

import { TestPlugin } from './mocks/TestAPI';
import { describe, test, expect } from 'bun:test';

const plugin = new TestPlugin();
const parser = plugin.api.inputFieldParser;

describe('should not error or warn cases', () => {
	describe('no templates, no local scope', () => {
		test('INPUT[text]', () => {
			const res = parser.parseString('INPUT[text]', undefined);

			expect(res.errorCollection.hasWarnings()).toBe(false);
			expect(res.errorCollection.hasErrors()).toBe(false);
		});

		test('INPUT[select(option(a), option(b, c), showcase)]', () => {
			const res = parser.parseString('INPUT[select(option(a), option(b, c), showcase)]', undefined);

			expect(res.errorCollection.hasWarnings()).toBe(false);
			expect(res.errorCollection.hasErrors()).toBe(false);
		});

		test('INPUT[text:text]', () => {
			const res = parser.parseString('INPUT[text:text]', undefined);

			expect(res.errorCollection.hasWarnings()).toBe(false);
			expect(res.errorCollection.hasErrors()).toBe(false);
		});

		test('INPUT[text:["test"]]', () => {
			const res = parser.parseString('INPUT[text:["test"]]', undefined);

			expect(res.errorCollection.hasWarnings()).toBe(false);
			expect(res.errorCollection.hasErrors()).toBe(false);
		});

		test('INPUT[text:[0]]', () => {
			const res = parser.parseString('INPUT[text:[0]]', undefined);

			expect(res.errorCollection.hasWarnings()).toBe(false);
			expect(res.errorCollection.hasErrors()).toBe(false);
		});

		test('INPUT[text:file#text]', () => {
			const res = parser.parseString('INPUT[text:file#text]', undefined);

			expect(res.errorCollection.hasWarnings()).toBe(false);
			expect(res.errorCollection.hasErrors()).toBe(false);
		});

		test('INPUT[text:path/to/file#text]', () => {
			const res = parser.parseString('INPUT[text:path/to/file#text]', undefined);

			expect(res.errorCollection.hasWarnings()).toBe(false);
			expect(res.errorCollection.hasErrors()).toBe(false);
		});

		test('INPUT[text:path/to/other file#text]', () => {
			const res = parser.parseString('INPUT[text:path/to/other file#text]', undefined);

			expect(res.errorCollection.hasWarnings()).toBe(false);
			expect(res.errorCollection.hasErrors()).toBe(false);
		});
	});
});

describe('should warn on deprecation', () => {
	test('INPUT[multi_select]', () => {
		const res = parser.parseString('INPUT[multi_select]', undefined);

		expect(res.errorCollection.hasWarnings()).toBe(true);
		expect(res.errorCollection.hasErrors()).toBe(false);
	});

	test('INPUT[date_picker]', () => {
		const res = parser.parseString('INPUT[date_picker]', undefined);

		expect(res.errorCollection.hasWarnings()).toBe(true);
		expect(res.errorCollection.hasErrors()).toBe(false);
	});

	test('INPUT[text_area]', () => {
		const res = parser.parseString('INPUT[text_area]', undefined);

		expect(res.errorCollection.hasWarnings()).toBe(true);
		expect(res.errorCollection.hasErrors()).toBe(false);
	});
});

describe('should warn on invalid argument', () => {
	test('INPUT[text(invalidArgument)]', () => {
		const res = parser.parseString('INPUT[text(invalidArgument)]', undefined);

		expect(res.errorCollection.hasWarnings()).toBe(true);
		expect(res.errorCollection.hasErrors()).toBe(false);
	});
});

describe('should error on invalid input field type', () => {
	test('INPUT[invalidType]', () => {
		const res = parser.parseString('INPUT[invalidType]', undefined);

		expect(res.errorCollection.hasWarnings()).toBe(false);
		expect(res.errorCollection.hasErrors()).toBe(true);
	});
});

// describe('apply template', () => {
// 	test('found', () => {
// 		InputFieldDeclarationParser.templates = [
// 			{
// 				identifier: 'Test',
// 				template: {
// 					isBound: true,
// 					bindTarget: 'Test#Target',
// 					argumentContainer: new InputFieldArgumentContainer(),
// 				} as InputFieldDeclaration,
// 			},
// 		];
//
// 		const inputFieldDeclaration: InputFieldDeclaration = InputFieldDeclarationParser.parseString('INPUT[toggle(class(a))]');
// 		InputFieldDeclarationParser.applyTemplate(inputFieldDeclaration, 'Test');
//
// 		expect(inputFieldDeclaration.isBound).toEqual(true);
// 		expect(inputFieldDeclaration.bindTarget).toEqual('Test#Target');
// 		expect(inputFieldDeclaration.inputFieldType).toEqual(InputFieldType.TOGGLE);
// 		expect(inputFieldDeclaration.argumentContainer.arguments[0].identifier).toEqual(InputFieldArgumentType.CLASS);
// 		expect(inputFieldDeclaration.argumentContainer.arguments[0].value).toEqual(['a']);
// 	});
// 	test('not found', () => {
// 		InputFieldDeclarationParser.templates = [];
//
// 		const inputFieldDeclaration: InputFieldDeclaration = InputFieldDeclarationParser.parseString('INPUT[toggle(class(a))]');
// 		expect(() => InputFieldDeclarationParser.applyTemplate(inputFieldDeclaration, 'Test')).toThrowError(MetaBindParsingError);
// 	});
// });
//
// describe('bind target', () => {
// 	test('no bind target', () => {
// 		const declaration: string = 'INPUT[toggle]';
// 		const inputFieldDeclaration: InputFieldDeclaration = InputFieldDeclarationParser.parseString(declaration);
//
// 		expect(inputFieldDeclaration.isBound).toEqual(false);
// 		expect(inputFieldDeclaration.bindTarget).toEqual('');
// 	});
//
// 	test('same file bind target', () => {
// 		const declaration: string = 'INPUT[toggle:target]';
// 		const inputFieldDeclaration: InputFieldDeclaration = InputFieldDeclarationParser.parseString(declaration);
//
// 		expect(inputFieldDeclaration.isBound).toEqual(true);
// 		expect(inputFieldDeclaration.bindTarget).toEqual('target');
// 	});
//
// 	test('other file bind target', () => {
// 		const declaration: string = 'INPUT[toggle:file#target]';
// 		const inputFieldDeclaration: InputFieldDeclaration = InputFieldDeclarationParser.parseString(declaration);
//
// 		expect(inputFieldDeclaration.isBound).toEqual(true);
// 		expect(inputFieldDeclaration.bindTarget).toEqual('file#target');
// 	});
//
// 	test('other file bind target path', () => {
// 		const declaration: string = 'INPUT[toggle:path/to/file#target]';
// 		const inputFieldDeclaration: InputFieldDeclaration = InputFieldDeclarationParser.parseString(declaration);
//
// 		expect(inputFieldDeclaration.isBound).toEqual(true);
// 		expect(inputFieldDeclaration.bindTarget).toEqual('path/to/file#target');
// 	});
// });
//
// describe('input type', () => {
// 	describe('all input types', () => {
// 		for (const entry of Object.entries(InputFieldType)) {
// 			if (entry[1] === 'invalid') {
// 				continue;
// 			}
// 			test(`${entry[1]} input type`, () => {
// 				const declaration: string = `INPUT[${entry[1]}:target]`;
// 				const inputFieldDeclaration: InputFieldDeclaration = InputFieldDeclarationParser.parseString(declaration);
//
// 				expect(inputFieldDeclaration.inputFieldType).toEqual(entry[1]);
// 			});
// 		}
// 	});
//
// 	test('input type with parentheses', () => {
// 		const declaration: string = 'INPUT[toggle()]';
// 		const inputFieldDeclaration: InputFieldDeclaration = InputFieldDeclarationParser.parseString(declaration);
//
// 		expect(inputFieldDeclaration.inputFieldType).toEqual('toggle');
// 	});
//
// 	test('input type with arguments', () => {
// 		const declaration: string = 'INPUT[toggle(class(a))]';
// 		const inputFieldDeclaration: InputFieldDeclaration = InputFieldDeclarationParser.parseString(declaration);
//
// 		expect(inputFieldDeclaration.inputFieldType).toEqual('toggle');
// 	});
//
// 	test('input type with arguments and bind target', () => {
// 		const declaration: string = 'INPUT[toggle(class(a)):file#target]';
// 		const inputFieldDeclaration: InputFieldDeclaration = InputFieldDeclarationParser.parseString(declaration);
//
// 		expect(inputFieldDeclaration.inputFieldType).toEqual('toggle');
// 	});
// });

// TODO: tests here

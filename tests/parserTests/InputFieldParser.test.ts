import { describe, expect, test } from 'bun:test';
import { TestMetaBind } from '../__mocks__/TestPlugin';

const mb = new TestMetaBind();
const TEST_FILE = 'test.md';

describe('should not error or warn cases', () => {
	describe('no templates, no local scope', () => {
		test('INPUT[text]', () => {
			const input = 'INPUT[text]';
			const res = mb.inputFieldParser.fromStringAndValidate(input, TEST_FILE, undefined);

			expect(mb.syntaxHighlighting.highlightInputFieldDeclaration(input, false).parsingError).toBeUndefined();

			expect(res.errorCollection.hasWarnings()).toBe(false);
			expect(res.errorCollection.hasErrors()).toBe(false);
		});

		test('INPUT[select(option(a), option(b, c), showcase)]', () => {
			const input = 'INPUT[select(option(a), option(b, c), showcase)]';
			const res = mb.inputFieldParser.fromStringAndValidate(input, TEST_FILE, undefined);

			expect(mb.syntaxHighlighting.highlightInputFieldDeclaration(input, false).parsingError).toBeUndefined();

			expect(res.errorCollection.hasWarnings()).toBe(false);
			expect(res.errorCollection.hasErrors()).toBe(false);
		});

		test('INPUT[text:text]', () => {
			const input = 'INPUT[text:text]';
			const res = mb.inputFieldParser.fromStringAndValidate(input, TEST_FILE, undefined);

			expect(mb.syntaxHighlighting.highlightInputFieldDeclaration(input, false).parsingError).toBeUndefined();

			expect(res.errorCollection.hasWarnings()).toBe(false);
			expect(res.errorCollection.hasErrors()).toBe(false);
		});

		test('INPUT[text:["test"]]', () => {
			const input = 'INPUT[text:["test"]]';
			const res = mb.inputFieldParser.fromStringAndValidate(input, TEST_FILE, undefined);

			expect(mb.syntaxHighlighting.highlightInputFieldDeclaration(input, false).parsingError).toBeUndefined();

			expect(res.errorCollection.hasWarnings()).toBe(false);
			expect(res.errorCollection.hasErrors()).toBe(false);
		});

		test('INPUT[text:[0]]', () => {
			const input = 'INPUT[text:[0]]';
			const res = mb.inputFieldParser.fromStringAndValidate(input, TEST_FILE, undefined);

			expect(mb.syntaxHighlighting.highlightInputFieldDeclaration(input, false).parsingError).toBeUndefined();

			expect(res.errorCollection.hasWarnings()).toBe(false);
			expect(res.errorCollection.hasErrors()).toBe(false);
		});

		test('INPUT[text:file#text]', () => {
			const input = 'INPUT[text:file#text]';
			const res = mb.inputFieldParser.fromStringAndValidate(input, TEST_FILE, undefined);

			expect(mb.syntaxHighlighting.highlightInputFieldDeclaration(input, false).parsingError).toBeUndefined();

			expect(res.errorCollection.hasWarnings()).toBe(false);
			expect(res.errorCollection.hasErrors()).toBe(false);
		});

		test('INPUT[text:path/to/file#text]', () => {
			const input = 'INPUT[text:path/to/file#text]';
			const res = mb.inputFieldParser.fromStringAndValidate(input, TEST_FILE, undefined);

			expect(mb.syntaxHighlighting.highlightInputFieldDeclaration(input, false).parsingError).toBeUndefined();

			expect(res.errorCollection.hasWarnings()).toBe(false);
			expect(res.errorCollection.hasErrors()).toBe(false);
		});

		test('INPUT[text:path/to/other file#text]', () => {
			const input = 'INPUT[text:path/to/other file#text]';
			const res = mb.inputFieldParser.fromStringAndValidate(input, TEST_FILE, undefined);

			expect(mb.syntaxHighlighting.highlightInputFieldDeclaration(input, false).parsingError).toBeUndefined();

			expect(res.errorCollection.hasWarnings()).toBe(false);
			expect(res.errorCollection.hasErrors()).toBe(false);
		});
	});
});

// describe('should warn on deprecation', () => {
//
// });

describe('should warn on invalid argument', () => {
	test('INPUT[text(invalidArgument)]', () => {
		const input = 'INPUT[text(invalidArgument)]';
		const res = mb.inputFieldParser.fromStringAndValidate(input, TEST_FILE, undefined);

		// syntax highlighting should still work
		expect(mb.syntaxHighlighting.highlightInputFieldDeclaration(input, false).parsingError).toBeUndefined();

		expect(res.errorCollection.hasWarnings()).toBe(true);
		expect(res.errorCollection.hasErrors()).toBe(false);
	});
});

describe('should error on invalid input field type', () => {
	test('INPUT[invalidType]', () => {
		const input = 'INPUT[invalidType]';
		const res = mb.inputFieldParser.fromStringAndValidate(input, TEST_FILE, undefined);

		// syntax highlighting should still work
		expect(mb.syntaxHighlighting.highlightInputFieldDeclaration(input, false).parsingError).toBeUndefined();

		expect(res.errorCollection.hasWarnings()).toBe(false);
		expect(res.errorCollection.hasErrors()).toBe(true);
	});
});

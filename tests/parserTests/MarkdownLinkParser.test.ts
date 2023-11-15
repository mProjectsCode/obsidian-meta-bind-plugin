import { describe, test, expect, beforeEach, spyOn, Mock } from 'bun:test';
import { parseMdLink, parseMdLinkList } from '../../src/parsers/MarkdownLinkParser';

describe('markdown link parser', () => {
	describe('parse markdown link', () => {
		// --- wiki links ---

		test('should parse wiki link', () => {
			expect(parseMdLink('[[test]]')).toEqual({
				isEmbed: false,
				target: 'test',
				block: undefined,
				alias: undefined,
				internal: true,
			});
		});

		test('should parse wiki link embed', () => {
			expect(parseMdLink('![[test]]')).toEqual({
				isEmbed: true,
				target: 'test',
				block: undefined,
				alias: undefined,
				internal: true,
			});
		});

		test('should parse wiki with block', () => {
			expect(parseMdLink('[[test#123]]')).toEqual({
				isEmbed: false,
				target: 'test',
				block: '123',
				alias: undefined,
				internal: true,
			});
		});

		test('should parse wiki with alias', () => {
			expect(parseMdLink('[[test|something]]')).toEqual({
				isEmbed: false,
				target: 'test',
				block: undefined,
				alias: 'something',
				internal: true,
			});
		});

		test('should parse wiki with block and alias', () => {
			expect(parseMdLink('[[test#123|something]]')).toEqual({
				isEmbed: false,
				target: 'test',
				block: '123',
				alias: 'something',
				internal: true,
			});
		});

		// --- markdown links ---

		test('should parse markdown link', () => {
			expect(parseMdLink('[something](test)')).toEqual({
				isEmbed: false,
				target: 'test',
				block: undefined,
				alias: 'something',
				internal: true,
			});
		});

		test('should parse markdown link embed', () => {
			expect(parseMdLink('![something](test)')).toEqual({
				isEmbed: true,
				target: 'test',
				block: undefined,
				alias: 'something',
				internal: true,
			});
		});

		test('should parse external markdown link', () => {
			expect(parseMdLink('[github](https://github.com)')).toEqual({
				isEmbed: false,
				target: 'https://github.com',
				block: undefined,
				alias: 'github',
				internal: false,
			});
		});

		// --- errors ---

		test('should fail on non markdown link', () => {
			expect(() => parseMdLink('something else')).toThrow();
		});
	});

	describe('parse markdown link list', () => {
		test('should parse link list', () => {
			expect(() =>
				parseMdLinkList('[[test]], [github](https://github.com), [[test#123|something]]'),
			).not.toThrow();
		});

		test('should fail on non markdown link in list', () => {
			expect(() => parseMdLinkList('[[test]], [github](https://github.com), something else')).toThrow();
		});

		test('should fail on missing comma', () => {
			expect(() => parseMdLinkList('[[test]] [github](https://github.com), [[test#123|something]]')).toThrow();
		});
	});
});

import { describe, expect, test } from 'bun:test';
import { MarkdownLink, MDLinkParser } from 'meta-bind-core/src/parsers/MarkdownLinkParser';

interface LinkObj {
	isEmbed: boolean;
	target: string;
	block?: string;
	alias?: string;
	internal: boolean;
}

function toLink(obj: LinkObj): MarkdownLink {
	return new MarkdownLink(obj.isEmbed, obj.target, obj.block, obj.alias, obj.internal);
}

describe('markdown link parser', () => {
	describe('parse markdown link', () => {
		// --- wiki links ---

		test('should parse wiki link', () => {
			expect(MDLinkParser.parseLink('[[test]]')).toEqual(
				toLink({
					isEmbed: false,
					target: 'test',
					block: undefined,
					alias: undefined,
					internal: true,
				}),
			);
		});

		test('should parse wiki link embed', () => {
			expect(MDLinkParser.parseLink('![[test]]')).toEqual(
				toLink({
					isEmbed: true,
					target: 'test',
					block: undefined,
					alias: undefined,
					internal: true,
				}),
			);
		});

		test('should parse wiki with heading', () => {
			expect(MDLinkParser.parseLink('[[test#123]]')).toEqual(
				toLink({
					isEmbed: false,
					target: 'test',
					block: '123',
					alias: undefined,
					internal: true,
				}),
			);
		});

		test('should parse wiki with only heading', () => {
			expect(MDLinkParser.parseLink('[[#123]]')).toEqual(
				toLink({
					isEmbed: false,
					target: '',
					block: '123',
					alias: undefined,
					internal: true,
				}),
			);
		});

		test('should parse wiki with block', () => {
			expect(MDLinkParser.parseLink('[[test#^123]]')).toEqual(
				toLink({
					isEmbed: false,
					target: 'test',
					block: '^123',
					alias: undefined,
					internal: true,
				}),
			);
		});

		test('should parse wiki only block', () => {
			expect(MDLinkParser.parseLink('[[#^123]]')).toEqual(
				toLink({
					isEmbed: false,
					target: '',
					block: '^123',
					alias: undefined,
					internal: true,
				}),
			);
		});

		test('should parse wiki with heading and block', () => {
			expect(MDLinkParser.parseLink('[[test#123^456]]')).toEqual(
				toLink({
					isEmbed: false,
					target: 'test',
					block: '123^456',
					alias: undefined,
					internal: true,
				}),
			);
		});

		test('should parse wiki with only heading and block', () => {
			expect(MDLinkParser.parseLink('[[#123^456]]')).toEqual(
				toLink({
					isEmbed: false,
					target: '',
					block: '123^456',
					alias: undefined,
					internal: true,
				}),
			);
		});

		test('should parse wiki with alias', () => {
			expect(MDLinkParser.parseLink('[[test|something]]')).toEqual(
				toLink({
					isEmbed: false,
					target: 'test',
					block: undefined,
					alias: 'something',
					internal: true,
				}),
			);
		});

		test('should parse wiki with block and alias', () => {
			expect(MDLinkParser.parseLink('[[test#123|something]]')).toEqual(
				toLink({
					isEmbed: false,
					target: 'test',
					block: '123',
					alias: 'something',
					internal: true,
				}),
			);
		});

		// --- markdown links ---

		test('should parse markdown link', () => {
			expect(MDLinkParser.parseLink('[something](test)')).toEqual(
				toLink({
					isEmbed: false,
					target: 'test',
					block: undefined,
					alias: 'something',
					internal: true,
				}),
			);
		});

		test('should parse markdown link embed', () => {
			expect(MDLinkParser.parseLink('![something](test)')).toEqual(
				toLink({
					isEmbed: true,
					target: 'test',
					block: undefined,
					alias: 'something',
					internal: true,
				}),
			);
		});

		test('should parse external markdown link', () => {
			expect(MDLinkParser.parseLink('[github](https://github.com)')).toEqual(
				toLink({
					isEmbed: false,
					target: 'https://github.com',
					block: undefined,
					alias: 'github',
					internal: false,
				}),
			);
		});

		// --- errors ---

		test('should fail on non markdown link', () => {
			expect(() => MDLinkParser.parseLink('something else')).toThrow();
		});
	});

	describe('parse markdown link list', () => {
		test('should parse link list', () => {
			expect(() =>
				MDLinkParser.parseLinkList('[[test]], [github](https://github.com), [[test#123|something]]'),
			).not.toThrow();
		});

		test('should fail on non markdown link in list', () => {
			expect(() =>
				MDLinkParser.parseLinkList('[[test]], [github](https://github.com), something else'),
			).toThrow();
		});

		test('should fail on missing comma', () => {
			expect(() =>
				MDLinkParser.parseLinkList('[[test]] [github](https://github.com), [[test#123|something]]'),
			).toThrow();
		});
	});

	describe('serialize link with toString', () => {
		test('should serialize wiki link without alias', () => {
			const link = MDLinkParser.parseLink('[[test]]');
			expect(link.toString()).toBe('[[test]]');
		});

		test('should serialize wiki link with alias', () => {
			const link = MDLinkParser.parseLink('[[test|display]]');
			expect(link.toString()).toBe('[[test|display]]');
		});

		test('should serialize wiki link with block', () => {
			const link = MDLinkParser.parseLink('[[test#123]]');
			expect(link.toString()).toBe('[[test#123]]');
		});

		test('should serialize wiki link with block and alias', () => {
			const link = MDLinkParser.parseLink('[[test#123|display]]');
			expect(link.toString()).toBe('[[test#123|display]]');
		});

		test('should serialize external markdown link', () => {
			const link = MDLinkParser.parseLink('[github](https://github.com)');
			expect(link.toString()).toBe('[github](https://github.com)');
		});

		test('should serialize external markdown image link', () => {
			const link = MDLinkParser.parseLink('![alt](https://example.com/image.png)');
			expect(link.toString()).toBe('![alt](https://example.com/image.png)');
		});
	});

	describe('modify link alias and serialize', () => {
		test('should add alias to wiki link without alias', () => {
			const link = MDLinkParser.parseLink('[[test]]');
			link.alias = 'custom text';
			expect(link.toString()).toBe('[[test|custom text]]');
		});

		test('should change existing alias on wiki link', () => {
			const link = MDLinkParser.parseLink('[[test|old alias]]');
			link.alias = 'new alias';
			expect(link.toString()).toBe('[[test|new alias]]');
		});

		test('should change alias while preserving block reference', () => {
			const link = MDLinkParser.parseLink('[[test#123|old alias]]');
			link.alias = 'new alias';
			expect(link.toString()).toBe('[[test#123|new alias]]');
		});

		test('should change alias on external markdown link', () => {
			const link = MDLinkParser.parseLink('[old](https://github.com)');
			link.alias = 'GitHub';
			expect(link.toString()).toBe('[GitHub](https://github.com)');
		});

		test('should change alias on external markdown image link', () => {
			const link = MDLinkParser.parseLink('![old alt](https://example.com/image.png)');
			link.alias = 'new alt';
			expect(link.toString()).toBe('![new alt](https://example.com/image.png)');
		});

		test('should handle empty alias string', () => {
			const link = MDLinkParser.parseLink('[[test|original]]');
			link.alias = '';
			// Empty string is falsy, so it won't render the alias in toString
			expect(link.toString()).toBe('[[test]]');
		});

		test('should clear alias by setting to undefined', () => {
			const link = MDLinkParser.parseLink('[[test|alias]]');
			link.alias = undefined;
			expect(link.toString()).toBe('[[test]]');
		});
	});
});

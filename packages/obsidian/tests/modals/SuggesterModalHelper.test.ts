import { describe, expect, spyOn, test } from 'bun:test';
import { createLinkWithAlias, getAliasSuggesterOptions } from 'meta-bind-obsidian/src/modals/SuggesterModalHelper';

describe('createLinkWithAlias', () => {
	describe('wiki links', () => {
		test('should create link with alias from plain wiki link', () => {
			const result = createLinkWithAlias('[[myfile]]', 'My Alias');
			expect(result).toBe('[[myfile|My Alias]]');
		});

		test('should replace existing alias on wiki link', () => {
			const result = createLinkWithAlias('[[myfile|oldAlias]]', 'newAlias');
			expect(result).toBe('[[myfile|newAlias]]');
		});

		test('should preserve block reference when adding alias', () => {
			const result = createLinkWithAlias('[[myfile#section]]', 'Display Text');
			expect(result).toBe('[[myfile#section|Display Text]]');
		});

		test('should preserve block reference when replacing alias', () => {
			const result = createLinkWithAlias('[[myfile#section|old]]', 'new');
			expect(result).toBe('[[myfile#section|new]]');
		});

		test('should handle embedded links', () => {
			const result = createLinkWithAlias('![[myfile]]', 'Alt Text');
			expect(result).toBe('![[myfile|Alt Text]]');
		});

		test('should handle spaces in alias', () => {
			const result = createLinkWithAlias('[[myfile]]', 'Multi Word Alias');
			expect(result).toBe('[[myfile|Multi Word Alias]]');
		});
	});

	describe('markdown links', () => {
		test('should replace alias on markdown link', () => {
			const result = createLinkWithAlias('[old text](path/to/file)', 'new text');
			expect(result).toBe('[new text](path/to/file)');
		});

		test('should replace alias on markdown image link', () => {
			const result = createLinkWithAlias('![old alt](path/to/image)', 'new alt');
			expect(result).toBe('![new alt](path/to/image)');
		});

		test('should replace alias on external markdown link', () => {
			const result = createLinkWithAlias('[old](https://example.com)', 'new');
			expect(result).toBe('[new](https://example.com)');
		});
	});

	describe('non-link inputs', () => {
		test('should return plain text unchanged', () => {
			const result = createLinkWithAlias('plain text', 'alias');
			expect(result).toBe('plain text');
		});

		test('should return empty string unchanged', () => {
			const result = createLinkWithAlias('', 'alias');
			expect(result).toBe('');
		});

		test('should return malformed link unchanged', () => {
			const result = createLinkWithAlias('[incomplete link', 'alias');
			expect(result).toBe('[incomplete link');
		});

		test('should handle null-like string gracefully', () => {
			const result = createLinkWithAlias('null', 'alias');
			expect(result).toBe('null');
		});
	});

	describe('edge cases', () => {
		test('should handle empty alias string', () => {
			const result = createLinkWithAlias('[[file]]', '');
			expect(result).toBe('[[file|]]');
		});

		test('should handle alias with special characters', () => {
			const result = createLinkWithAlias('[[file]]', '@#$%^&*()');
			expect(result).toBe('[[file|@#$%^&*()]]');
		});

		test('should handle unicode in alias', () => {
			const result = createLinkWithAlias('[[file]]', '文件 (File)');
			expect(result).toBe('[[file|文件 (File)]]');
		});

		test('should handle pipe character in alias', () => {
			const result = createLinkWithAlias('[[file]]', 'text | with | pipes');
			expect(result).toBe('[[file|text | with | pipes]]');
		});
	});
});

describe('getAliasSuggesterOptions', () => {
	test('should create an option for each alias', () => {
		const options = getAliasSuggesterOptions('[[file]]', 'file', 'folder/file.md', ['Alias One', 'Alias Two']);

		expect(options.map(o => o.value)).toEqual(['[[file|Alias One]]', '[[file|Alias Two]]']);
		expect(options.map(o => o.displayValue)).toEqual(['Alias One', 'Alias Two']);
	});

	test('should skip an alias that is identical to the file name', () => {
		const options = getAliasSuggesterOptions('[[file]]', 'file', 'folder/file.md', ['file', 'Real Alias']);

		expect(options.map(o => o.displayValue)).toEqual(['Real Alias']);
	});

	test('should skip a file-name-matching alias case-insensitively and ignoring whitespace', () => {
		const options = getAliasSuggesterOptions('[[file]]', 'file', 'folder/file.md', [' File ', 'FILE']);

		expect(options).toEqual([]);
	});

	test('should skip empty or whitespace-only aliases', () => {
		const options = getAliasSuggesterOptions('[[file]]', 'file', 'folder/file.md', ['', '   ']);

		expect(options).toEqual([]);
	});

	test('should ignore non-string entries in the aliases array', () => {
		const options = getAliasSuggesterOptions('[[file]]', 'file', 'folder/file.md', [123, null, 'Valid Alias']);

		expect(options.map(o => o.displayValue)).toEqual(['Valid Alias']);
	});

	test('should return no options and not throw when aliases is undefined or null', () => {
		expect(getAliasSuggesterOptions('[[file]]', 'file', 'folder/file.md', undefined)).toEqual([]);
		expect(getAliasSuggesterOptions('[[file]]', 'file', 'folder/file.md', null)).toEqual([]);
	});

	test('should warn and return no options when aliases is present but not an array', () => {
		const warnSpy = spyOn(console, 'warn').mockImplementation(() => {});

		const options = getAliasSuggesterOptions('[[file]]', 'file', 'folder/file.md', 'Not An Array');

		expect(options).toEqual([]);
		expect(warnSpy).toHaveBeenCalled();

		warnSpy.mockRestore();
	});
});

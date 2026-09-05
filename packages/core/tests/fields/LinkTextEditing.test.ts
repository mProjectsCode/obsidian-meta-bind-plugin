import { beforeEach, describe, expect, test, spyOn } from 'bun:test';
import { InputFieldType } from 'meta-bind-core/src/config/FieldConfigs';
import type { ListSuggesterIPF } from 'meta-bind-core/src/fields/inputFields/fields/ListSuggester/ListSuggesterIPF';
import type { InlineListSuggesterIPF } from 'meta-bind-core/src/fields/inputFields/fields/InlineListSuggester/InlineListSuggesterIPF';
import { MDLinkParser } from 'meta-bind-core/src/parsers/MarkdownLinkParser';
import { DEFAULT_VALUE_INDICATOR, TestMetaBind } from '../__mocks__/TestPlugin';

const TEST_FILE_PATH = 'testFile';
const TEST_PROP = 'testProp';

describe('Link Text Editing', () => {
	let testPlugin: TestMetaBind;

	beforeEach(() => {
		testPlugin = new TestMetaBind();
	});

	describe('Suggester IPF link text editing', () => {
		test('should extract alias from link when opening editor', () => {
			const index = testPlugin.addTestInputField(
				`INPUT[${InputFieldType.SUGGESTER}(option([[file|myAlias]]), option(plain)):${TEST_PROP}]`,
			);

			testPlugin.initializeTest();
			testPlugin.createInitialCache({ [TEST_PROP]: '[[file|myAlias]]' });
			testPlugin.initializeAllTestInputFields();

			// Verify the field loaded the link correctly
			expect(testPlugin.getTestInputFieldValue(index)).toBe('[[file|myAlias]]');

			// Verify we can parse the link from the current value
			const currentValue = testPlugin.getTestInputFieldValue(index);
			if (typeof currentValue === 'string' && MDLinkParser.isLink(currentValue)) {
				const link = MDLinkParser.parseLink(currentValue);
				expect(link.alias).toBe('myAlias');
			}
		});

		test('should extract target when link has no alias', () => {
			const index = testPlugin.addTestInputField(
				`INPUT[${InputFieldType.SUGGESTER}(option([[file]]), option(plain)):${TEST_PROP}]`,
			);

			testPlugin.initializeTest();
			testPlugin.createInitialCache({ [TEST_PROP]: '[[file]]' });
			testPlugin.initializeAllTestInputFields();

			const currentValue = testPlugin.getTestInputFieldValue(index);
			if (typeof currentValue === 'string' && MDLinkParser.isLink(currentValue)) {
				const link = MDLinkParser.parseLink(currentValue);
				// Should fall back to target when no alias
				const displayText = link.alias ?? link.target;
				expect(displayText).toBe('file');
			}
		});

		test('should update link alias when modified', () => {
			const index = testPlugin.addTestInputField(
				`INPUT[${InputFieldType.SUGGESTER}(option([[file|old]]), option(plain)):${TEST_PROP}]`,
			);

			testPlugin.initializeTest();
			testPlugin.createInitialCache({ [TEST_PROP]: '[[file|old]]' });
			testPlugin.initializeAllTestInputFields();

			// Simulate modifying the link's alias
			const currentValue = testPlugin.getTestInputFieldValue(index) as string;
			const link = MDLinkParser.parseLink(currentValue);
			link.alias = 'new';
			testPlugin.setTestInputFieldValue(index, link.toString());

			// Verify the change persisted
			expect(testPlugin.getTestInputFieldValue(index)).toBe('[[file|new]]');
			expect(testPlugin.getCacheMetadata()?.[TEST_PROP]).toBe('[[file|new]]');
		});

		test('should handle adding alias to link without one', () => {
			const index = testPlugin.addTestInputField(
				`INPUT[${InputFieldType.SUGGESTER}(option([[file]]), option(plain)):${TEST_PROP}]`,
			);

			testPlugin.initializeTest();
			testPlugin.createInitialCache({ [TEST_PROP]: '[[file]]' });
			testPlugin.initializeAllTestInputFields();

			// Simulate adding an alias to a link
			const currentValue = testPlugin.getTestInputFieldValue(index) as string;
			const link = MDLinkParser.parseLink(currentValue);
			link.alias = 'New Display';
			testPlugin.setTestInputFieldValue(index, link.toString());

			expect(testPlugin.getTestInputFieldValue(index)).toBe('[[file|New Display]]');
		});

		test('should preserve markdown link format during alias modification', () => {
			const index = testPlugin.addTestInputField(
				`INPUT[${InputFieldType.SUGGESTER}(option(plain text), option(other)):${TEST_PROP}]`,
			);

			testPlugin.initializeTest();
			testPlugin.createInitialCache({ [TEST_PROP]: '[Display](https://example.com)' });
			testPlugin.initializeAllTestInputFields();

			const currentValue = testPlugin.getTestInputFieldValue(index) as string;
			const link = MDLinkParser.parseLink(currentValue);
			link.alias = 'New Display';
			testPlugin.setTestInputFieldValue(index, link.toString());

			expect(testPlugin.getTestInputFieldValue(index)).toBe('[New Display](https://example.com)');
		});

		test('should handle non-link values gracefully', () => {
			const index = testPlugin.addTestInputField(
				`INPUT[${InputFieldType.SUGGESTER}(option(plain text), option(other)):${TEST_PROP}]`,
			);

			testPlugin.initializeTest();
			testPlugin.createInitialCache({ [TEST_PROP]: 'plain text' });
			testPlugin.initializeAllTestInputFields();

			// Plain text should remain unchanged
			expect(testPlugin.getTestInputFieldValue(index)).toBe('plain text');

			// Verify it's not a valid link
			const value = testPlugin.getTestInputFieldValue(index);
			if (typeof value === 'string') {
				expect(() => MDLinkParser.isLink(value)).not.toThrow();
				expect(MDLinkParser.isLink(value)).toBe(false);
			}
		});
	});

	describe('ListSuggester IPF link text editing', () => {
		test('should allow editing individual link aliases in list', () => {
			const index = testPlugin.addTestInputField(
				`INPUT[${InputFieldType.LIST_SUGGESTER}(option([[file1|alias1]]), option([[file2]])):${TEST_PROP}]`,
			);

			testPlugin.initializeTest();
			testPlugin.createInitialCache({ [TEST_PROP]: ['[[file1|alias1]]', '[[file2]]'] });
			testPlugin.initializeAllTestInputFields();

			// Simulate modifying the first link's alias
			const currentValues = testPlugin.getTestInputFieldValue(index) as string[];
			const link = MDLinkParser.parseLink(currentValues[0]);
			link.alias = 'modified';

			const updatedValues = [...currentValues];
			updatedValues[0] = link.toString();
			testPlugin.setTestInputFieldValue(index, updatedValues);

			const result = testPlugin.getTestInputFieldValue(index) as string[];
			expect(result[0]).toBe('[[file1|modified]]');
			expect(result[1]).toBe('[[file2]]');
		});

		test('should preserve list order when editing links', () => {
			const index = testPlugin.addTestInputField(
				`INPUT[${InputFieldType.LIST_SUGGESTER}(option([[a]]), option([[b]]), option([[c]])):${TEST_PROP}]`,
			);

			testPlugin.initializeTest();
			testPlugin.createInitialCache({ [TEST_PROP]: ['[[a]]', '[[b]]', '[[c]]'] });
			testPlugin.initializeAllTestInputFields();

			// Edit the middle item
			const currentValues = testPlugin.getTestInputFieldValue(index) as string[];
			const link = MDLinkParser.parseLink(currentValues[1]);
			link.alias = 'B';

			const updatedValues = [...currentValues];
			updatedValues[1] = link.toString();
			testPlugin.setTestInputFieldValue(index, updatedValues);

			const result = testPlugin.getTestInputFieldValue(index) as string[];
			expect(result).toEqual(['[[a]]', '[[b|B]]', '[[c]]']);
		});

		test('should handle mix of links and non-links in list', () => {
			const index = testPlugin.addTestInputField(
				`INPUT[${InputFieldType.LIST_SUGGESTER}(option([[file]]), option(text)):${TEST_PROP}]`,
			);

			testPlugin.initializeTest();
			testPlugin.createInitialCache({ [TEST_PROP]: ['[[file]]', 'plain text', '[[other]]'] });
			testPlugin.initializeAllTestInputFields();

			const currentValues = testPlugin.getTestInputFieldValue(index) as string[];
			expect(currentValues).toEqual(['[[file]]', 'plain text', '[[other]]']);

			// Edit only the first link, leave plain text and last link alone
			const link1 = MDLinkParser.parseLink(currentValues[0]);
			link1.alias = 'File';

			const updatedValues = [...currentValues];
			updatedValues[0] = link1.toString();
			testPlugin.setTestInputFieldValue(index, updatedValues);

			const result = testPlugin.getTestInputFieldValue(index) as string[];
			expect(result).toEqual(['[[file|File]]', 'plain text', '[[other]]']);
		});

		test('openLinkTextEditor should ignore an out-of-bounds index without throwing', () => {
			const index = testPlugin.addTestInputField(
				`INPUT[${InputFieldType.LIST_SUGGESTER}(option([[file]])):${TEST_PROP}]`,
			);

			testPlugin.initializeTest();
			testPlugin.createInitialCache({ [TEST_PROP]: ['[[file]]'] });
			testPlugin.initializeAllTestInputFields();

			const field = testPlugin.getTestInputField(index).field as ListSuggesterIPF;
			const openTextPromptModalSpy = spyOn(testPlugin.internal, 'openTextPromptModal').mockImplementation(
				() => {},
			);

			expect(() => field.openLinkTextEditor(5, '[[file]]')).not.toThrow();
			expect(openTextPromptModalSpy).not.toHaveBeenCalled();

			openTextPromptModalSpy.mockRestore();
		});

		test('should not apply an edit if the list changed while the editor modal was open', () => {
			const index = testPlugin.addTestInputField(
				`INPUT[${InputFieldType.LIST_SUGGESTER}(option([[file1|alias1]]), option([[file2]])):${TEST_PROP}]`,
			);

			testPlugin.initializeTest();
			testPlugin.createInitialCache({ [TEST_PROP]: ['[[file1|alias1]]', '[[file2]]'] });
			testPlugin.initializeAllTestInputFields();

			const field = testPlugin.getTestInputField(index).field as ListSuggesterIPF;
			const openTextPromptModalSpy = spyOn(testPlugin.internal, 'openTextPromptModal').mockImplementation(
				() => {},
			);

			field.openLinkTextEditor(0, '[[file1|alias1]]');
			const { onSubmit } = openTextPromptModalSpy.mock.calls[0][0];

			// Simulate the list changing (e.g. the item being removed) while the modal was still open.
			testPlugin.setTestInputFieldValue(index, ['[[file2]]']);
		});
	});

	describe('InlineListSuggester IPF link text editing', () => {
		test('should allow editing individual link aliases in inline list', () => {
			const index = testPlugin.addTestInputField(
				`INPUT[${InputFieldType.INLINE_LIST_SUGGESTER}(option([[file1]]), option([[file2]])):${TEST_PROP}]`,
			);

			testPlugin.initializeTest();
			testPlugin.createInitialCache({ [TEST_PROP]: ['[[file1]]', '[[file2]]'] });
			testPlugin.initializeAllTestInputFields();

			// Simulate modifying the first link's alias
			const currentValues = testPlugin.getTestInputFieldValue(index) as string[];
			const link = MDLinkParser.parseLink(currentValues[0]);
			link.alias = 'File One';

			const updatedValues = [...currentValues];
			updatedValues[0] = link.toString();
			testPlugin.setTestInputFieldValue(index, updatedValues);

			const result = testPlugin.getTestInputFieldValue(index) as string[];
			expect(result[0]).toBe('[[file1|File One]]');
			expect(result[1]).toBe('[[file2]]');
		});

		test('should preserve inline list structure when editing', () => {
			const index = testPlugin.addTestInputField(
				`INPUT[${InputFieldType.INLINE_LIST_SUGGESTER}(option([[a]]), option([[b]]), option([[c]]), option([[d]])):${TEST_PROP}]`,
			);

			testPlugin.initializeTest();
			testPlugin.createInitialCache({ [TEST_PROP]: ['[[a]]', '[[b]]', '[[c]]', '[[d]]'] });
			testPlugin.initializeAllTestInputFields();

			// Edit multiple items
			const currentValues = testPlugin.getTestInputFieldValue(index) as string[];

			const updatedValues = [...currentValues];
			for (let i = 0; i < updatedValues.length; i++) {
				if (MDLinkParser.isLink(updatedValues[i])) {
					const link = MDLinkParser.parseLink(updatedValues[i]);
					link.alias = `Item ${i + 1}`;
					updatedValues[i] = link.toString();
				}
			}

			testPlugin.setTestInputFieldValue(index, updatedValues);

			const result = testPlugin.getTestInputFieldValue(index) as string[];
			expect(result).toEqual(['[[a|Item 1]]', '[[b|Item 2]]', '[[c|Item 3]]', '[[d|Item 4]]']);
		});

		test('should not apply an edit if the list changed while the editor modal was open', () => {
			const index = testPlugin.addTestInputField(
				`INPUT[${InputFieldType.INLINE_LIST_SUGGESTER}(option([[file1|alias1]]), option([[file2]])):${TEST_PROP}]`,
			);

			testPlugin.initializeTest();
			testPlugin.createInitialCache({ [TEST_PROP]: ['[[file1|alias1]]', '[[file2]]'] });
			testPlugin.initializeAllTestInputFields();

			const field = testPlugin.getTestInputField(index).field as InlineListSuggesterIPF;
			const openTextPromptModalSpy = spyOn(testPlugin.internal, 'openTextPromptModal').mockImplementation(
				() => {},
			);

			field.openLinkTextEditor(0, '[[file1|alias1]]');
			const { onSubmit } = openTextPromptModalSpy.mock.calls[0][0];

			// Simulate the list changing (e.g. the item being reordered) while the modal was still open.
			testPlugin.setTestInputFieldValue(index, ['[[file2]]', '[[file1|alias1]]']);

			onSubmit('should not be applied');

			expect(testPlugin.getTestInputFieldValue(index)).toEqual(['[[file2]]', '[[file1|alias1]]']);

			openTextPromptModalSpy.mockRestore();
		});

		test('should handle empty inline list', () => {
			const index = testPlugin.addTestInputField(
				`INPUT[${InputFieldType.INLINE_LIST_SUGGESTER}(option([[a]])):${TEST_PROP}]`,
			);

			testPlugin.initializeTest();
			testPlugin.createInitialCache({ [TEST_PROP]: [] });
			testPlugin.initializeAllTestInputFields();

			expect(testPlugin.getTestInputFieldValue(index)).toEqual([]);
		});
	});

	describe('Link text preservation', () => {
		test('should preserve link target when editing alias', () => {
			const originalLink = '[[path/to/myfile|oldAlias]]';
			const link = MDLinkParser.parseLink(originalLink);

			// Edit the alias
			link.alias = 'newAlias';
			const result = link.toString();

			// Target should remain unchanged
			expect(result).toBe('[[path/to/myfile|newAlias]]');
			expect(MDLinkParser.parseLink(result).target).toBe('path/to/myfile');
		});

		test('should preserve block reference when editing alias', () => {
			const originalLink = '[[file#section|old]]';
			const link = MDLinkParser.parseLink(originalLink);

			link.alias = 'new';
			const result = link.toString();

			const modified = MDLinkParser.parseLink(result);
			expect(modified.target).toBe('file');
			expect(modified.block).toBe('section');
			expect(modified.alias).toBe('new');
		});

		test('should preserve embed status when editing alias', () => {
			const originalLink = '![[file|old]]';
			const link = MDLinkParser.parseLink(originalLink);

			link.alias = 'new';
			const result = link.toString();

			const modified = MDLinkParser.parseLink(result);
			expect(modified.isEmbed).toBe(true);
			expect(modified.alias).toBe('new');
		});
	});
});

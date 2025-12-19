import { describe, expect, test } from 'bun:test';
import {
	areArraysEqual,
	arrayStartsWith,
	clamp,
	ensureFileExtension,
	getFolderPathFromFilePath,
	joinPath,
	mod,
	optClamp,
	processDateFormatPlaceholders,
	remapRange,
	toArray,
	toEnumeration,
} from 'packages/core/src/utils/Utils';
import { areObjectsEqual } from 'packages/core/src/utils/Utils';

describe('utils', () => {
	describe('clamp function', () => {
		test('should return the number if it is within the range', () => {
			expect(clamp(5, 0, 10)).toBe(5);
		});

		test('should return the minimum value if the number is less than the minimum', () => {
			expect(clamp(-5, 0, 10)).toBe(0);
		});

		test('should return the maximum value if the number is greater than the maximum', () => {
			expect(clamp(15, 0, 10)).toBe(10);
		});

		test('should return the minimum value if the number is equal to the minimum', () => {
			expect(clamp(0, 0, 10)).toBe(0);
		});

		test('should return the maximum value if the number is equal to the maximum', () => {
			expect(clamp(10, 0, 10)).toBe(10);
		});
	});

	describe('optClamp function', () => {
		test('should return the number if it is within the range', () => {
			expect(optClamp(5, 0, 10)).toBe(5);
		});

		test('should return the minimum value if the number is less than the minimum', () => {
			expect(optClamp(-5, 0, 10)).toBe(0);
		});

		test('should return the maximum value if the number is greater than the maximum', () => {
			expect(optClamp(15, 0, 10)).toBe(10);
		});

		test('should return the minimum value if the number is equal to the minimum', () => {
			expect(optClamp(0, 0, 10)).toBe(0);
		});

		test('should return the maximum value if the number is equal to the maximum', () => {
			expect(optClamp(10, 0, 10)).toBe(10);
		});

		test('should return undefined if the number is undefined', () => {
			expect(optClamp(undefined, 0, 10)).toBeUndefined();
		});
	});

	describe('remapRange function', () => {
		test('should return the correct value when remapping a value within the range', () => {
			expect(remapRange(5, 0, 10, 0, 100)).toBe(50);
		});

		test('should return the correct value when remapping a value outside the range', () => {
			expect(remapRange(-5, 0, 10, 0, 100)).toBe(-50);
			expect(remapRange(15, 0, 10, 0, 100)).toBe(150);
		});

		test('should return the correct value when remapping to a new range that does not start at 0', () => {
			expect(remapRange(5, 0, 10, 50, 150)).toBe(100);
		});

		test('should return the correct value when remapping to a new range that does not end at 100', () => {
			expect(remapRange(5, 0, 10, 10, 20)).toBe(15);
		});

		test('should return the correct value when remapping to a new range that does not start at 0 and does not end at 100', () => {
			expect(remapRange(5, 0, 10, 25, 75)).toBe(50);
		});

		test('should return the correct value when remapping to a new range that is negative', () => {
			expect(remapRange(5, 0, 10, -100, -50)).toBe(-75);
		});
	});

	describe('mod function', () => {
		test('should return a positive number when given a positive number', () => {
			expect(mod(5, 3)).toBe(2);
		});

		test('should return a positive number when given a negative number', () => {
			expect(mod(-5, 3)).toBe(1);
		});

		test('should return 0 when given 0', () => {
			expect(mod(0, 3)).toBe(0);
		});

		test('should return a non-integer when given a non-integer', () => {
			expect(mod(5.5, 3)).toBe(2.5);
		});

		test('should return NaN when given NaN', () => {
			expect(mod(NaN, 3)).toBeNaN();
		});

		test('should return NaN when given Infinity', () => {
			expect(mod(Infinity, 3)).toBeNaN();
		});

		test('should return NaN when given -Infinity', () => {
			expect(mod(-Infinity, 3)).toBeNaN();
		});
	});

	describe('areArraysEqual function', () => {
		test('should return true for two empty arrays', () => {
			expect(areArraysEqual([], [])).toBe(true);
		});

		test('should return true for two arrays with the same elements in the same order', () => {
			expect(areArraysEqual([1, 2, 3], [1, 2, 3])).toBe(true);
		});

		test('should return false for two arrays with the same elements in a different order', () => {
			expect(areArraysEqual([1, 2, 3], [3, 2, 1])).toBe(false);
		});

		test('should return false for two arrays with different lengths', () => {
			expect(areArraysEqual([1, 2, 3], [1, 2])).toBe(false);
		});

		test('should return false for two arrays with different elements', () => {
			expect(areArraysEqual([1, 2, 3], [1, 2, 4])).toBe(false);
		});

		test('should return false for one array being undefined and the other not', () => {
			expect(areArraysEqual([1, 2, 3], undefined)).toBe(false);
			expect(areArraysEqual(undefined, [1, 2, 3])).toBe(false);
		});

		test('should return true for both arrays being undefined', () => {
			expect(areArraysEqual(undefined, undefined)).toBe(true);
		});
	});

	describe('arrayStartsWith function', () => {
		test('should return true when the array starts with the base array', () => {
			expect(arrayStartsWith([1, 2, 3], [1, 2])).toBe(true);
			expect(arrayStartsWith(['a', 'b', 'c'], ['a', 'b'])).toBe(true);
		});

		test('should return true when the array and the base array are equal', () => {
			expect(arrayStartsWith([1, 2, 3], [1, 2, 3])).toBe(true);
			expect(arrayStartsWith(['a', 'b', 'c'], ['a', 'b', 'c'])).toBe(true);
		});

		test('should return false when the array does not start with the base array', () => {
			expect(arrayStartsWith([1, 2, 3], [2, 3])).toBe(false);
			expect(arrayStartsWith([1, 2, 3], [1, 3])).toBe(false);
			expect(arrayStartsWith(['a', 'b', 'c'], ['b', 'c'])).toBe(false);
			expect(arrayStartsWith(['a', 'b', 'c'], ['a', 'c'])).toBe(false);
		});

		test('should return true when the base array is empty', () => {
			expect(arrayStartsWith([1, 2, 3], [])).toBe(true);
			expect(arrayStartsWith([], [])).toBe(true);
		});

		test('should return false when the array is empty and the base array is not', () => {
			expect(arrayStartsWith([], [1, 2, 3])).toBe(false);
		});

		test('should return true when both arrays are empty', () => {
			expect(arrayStartsWith([], [])).toBe(true);
		});
	});

	describe('toArray function', () => {
		test('should return an empty array when given undefined', () => {
			expect(toArray(undefined)).toEqual([]);
		});

		test('should return the same array when given an array', () => {
			expect(toArray([1, 2, 3])).toEqual([1, 2, 3]);
			expect(toArray(['a', 'b', 'c'])).toEqual(['a', 'b', 'c']);
		});

		test('should return an array with the value when given a single value', () => {
			expect(toArray(1)).toEqual([1]);
			expect(toArray('a')).toEqual(['a']);
			expect(toArray(true)).toEqual([true]);
			expect(toArray(null)).toEqual([null]);
		});
	});

	describe('ensureFileExtension function', () => {
		test('should add the extension if it is not present', () => {
			expect(ensureFileExtension('file', '.txt')).toBe('file.txt');
			expect(ensureFileExtension('file', 'txt')).toBe('file.txt');
		});

		test('should not add the extension if it is already present', () => {
			expect(ensureFileExtension('file.txt', '.txt')).toBe('file.txt');
			expect(ensureFileExtension('file.txt', 'txt')).toBe('file.txt');
		});

		test('should add the extension if a different extension is present', () => {
			expect(ensureFileExtension('file.md', '.txt')).toBe('file.md.txt');
			expect(ensureFileExtension('file.md', 'txt')).toBe('file.md.txt');
		});

		test('should handle file paths with multiple dots correctly', () => {
			expect(ensureFileExtension('file.name', '.txt')).toBe('file.name.txt');
			expect(ensureFileExtension('file.name', 'txt')).toBe('file.name.txt');
			expect(ensureFileExtension('file.name.txt', '.txt')).toBe('file.name.txt');
			expect(ensureFileExtension('file.name.txt', 'txt')).toBe('file.name.txt');
		});

		test('should handle empty file paths correctly', () => {
			expect(ensureFileExtension('', '.txt')).toBe('.txt');
			expect(ensureFileExtension('', 'txt')).toBe('.txt');
		});

		test('should handle empty extensions correctly', () => {
			expect(ensureFileExtension('file', '')).toBe('file.');
			expect(ensureFileExtension('file.txt', '')).toBe('file.txt.');
		});
	});

	describe('joinPath function', () => {
		test('should join paths without duplicate slashes', () => {
			expect(joinPath('path', 'to', 'file')).toBe('path/to/file');
			expect(joinPath('path/', '/to/', '/file')).toBe('path/to/file');
			expect(joinPath('path/', 'to/', 'file')).toBe('path/to/file');
			expect(joinPath('path', '/to', 'file')).toBe('path/to/file');
		});

		test('should handle single path correctly', () => {
			expect(joinPath('path')).toBe('path');
			expect(joinPath('/path')).toBe('path');
			expect(joinPath('path/')).toBe('path');
		});

		test('should handle empty paths correctly', () => {
			expect(joinPath('')).toBe('/');
			expect(joinPath('', '')).toBe('/');
			expect(joinPath('', 'path')).toBe('path');
			expect(joinPath('path', '')).toBe('path');
		});

		test('should handle paths with leading and trailing slashes correctly', () => {
			expect(joinPath('/path', 'to', 'file')).toBe('path/to/file');
			expect(joinPath('path', 'to', '/file')).toBe('path/to/file');
			expect(joinPath('/path', 'to', '/file')).toBe('path/to/file');
			expect(joinPath('/path/', '/to/', '/file/')).toBe('path/to/file');
		});

		test('should handle slashes only correctly', () => {
			expect(joinPath('/')).toBe('/');
			expect(joinPath('/', '/')).toBe('/');
			expect(joinPath('/', 'path')).toBe('path');
			expect(joinPath('path', '/')).toBe('path');
		});
	});

	describe('getFolderPathFromFilePath function', () => {
		test('should return the folder path from a file path', () => {
			expect(getFolderPathFromFilePath('/path/to/file.txt')).toBe('/path/to');
			expect(getFolderPathFromFilePath('/another/path/to/file.txt')).toBe('/another/path/to');
		});

		test('should return an empty string if there is no folder path', () => {
			expect(getFolderPathFromFilePath('file.txt')).toBe('');
			expect(getFolderPathFromFilePath('/file.txt')).toBe('');
		});

		test('should handle empty file paths correctly', () => {
			expect(getFolderPathFromFilePath('')).toBe('');
		});

		test('should handle file paths with trailing slashes correctly', () => {
			expect(getFolderPathFromFilePath('/path/to/')).toBe('/path/to');
			expect(getFolderPathFromFilePath('/path/to/file/')).toBe('/path/to/file');
		});
	});

	describe('toEnumeration function', () => {
		test('should return an empty string for an empty array', () => {
			expect(toEnumeration([], x => x)).toBe('');
		});

		test('should return the single element for an array with one element', () => {
			expect(toEnumeration(['apple'], x => x)).toBe('apple');
		});

		test('should return the two elements joined by the last separator for an array with two elements', () => {
			expect(toEnumeration(['apple', 'banana'], x => x)).toBe('apple and banana');
		});

		test('should return the elements joined by the separator and the last separator for an array with more than two elements', () => {
			expect(toEnumeration(['apple', 'banana', 'cherry'], x => x)).toBe('apple, banana and cherry');
		});

		test('should apply the map function to each element', () => {
			expect(toEnumeration(['apple', 'banana', 'cherry'], x => x.toUpperCase())).toBe('APPLE, BANANA and CHERRY');
		});

		test('should use the provided separator', () => {
			expect(toEnumeration(['apple', 'banana', 'cherry'], x => x, ' | ')).toBe('apple | banana and cherry');
		});

		test('should use the provided last separator', () => {
			expect(toEnumeration(['apple', 'banana', 'cherry'], x => x, ', ', 'or')).toBe('apple, banana or cherry');
		});

		test('should handle different separators and last separators', () => {
			expect(toEnumeration(['apple', 'banana', 'cherry'], x => x, ' - ', 'or')).toBe('apple - banana or cherry');
		});
	});

	describe('areObjectsEqual function', () => {
		test('should return true for two null values', () => {
			expect(areObjectsEqual(null, null)).toBe(true);
		});

		test('should return true for two undefined values', () => {
			expect(areObjectsEqual(undefined, undefined)).toBe(true);
		});

		test('should return false comparing null and undefined', () => {
			expect(areObjectsEqual(undefined, null)).toBe(false);
			expect(areObjectsEqual(null, undefined)).toBe(false);
		});

		test('should return false for one null and one non-null value', () => {
			expect(areObjectsEqual(null, {})).toBe(false);
			expect(areObjectsEqual({}, null)).toBe(false);
		});

		test('should return false for values of different types', () => {
			expect(areObjectsEqual(1, '1')).toBe(false);
			expect(areObjectsEqual({}, [])).toBe(false);
		});

		test('should return true for two empty objects', () => {
			expect(areObjectsEqual({}, {})).toBe(true);
		});

		test('should return true for two objects with the same properties and values', () => {
			expect(areObjectsEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
		});

		test('should return false for two objects with different properties', () => {
			expect(areObjectsEqual({ a: 1, b: 2 }, { a: 1, c: 2 })).toBe(false);
		});

		test('should return false for two objects with the same properties but different values', () => {
			expect(areObjectsEqual({ a: 1, b: 2 }, { a: 1, b: 3 })).toBe(false);
		});

		test('should return true for two arrays with the same elements in the same order', () => {
			expect(areObjectsEqual([1, 2, 3], [1, 2, 3])).toBe(true);
		});

		test('should return false for two arrays with the same elements in a different order', () => {
			expect(areObjectsEqual([1, 2, 3], [3, 2, 1])).toBe(false);
		});

		test('should return false for two arrays with different lengths', () => {
			expect(areObjectsEqual([1, 2, 3], [1, 2])).toBe(false);
		});

		test('should return true for nested objects that are equal', () => {
			expect(areObjectsEqual({ a: { b: 2 } }, { a: { b: 2 } })).toBe(true);
		});

		test('should return false for nested objects that are not equal', () => {
			expect(areObjectsEqual({ a: { b: 2 } }, { a: { b: 3 } })).toBe(false);
		});

		test('should return true for two identical functions', () => {
			const func = () => {};
			expect(areObjectsEqual(func, func)).toBe(true);
		});

		test('should return false for two different functions', () => {
			expect(
				areObjectsEqual(
					() => {},
					() => {},
				),
			).toBe(false);
		});
	});

	describe('processDateFormatPlaceholders function', () => {
		test('should return undefined for undefined input', () => {
			expect(processDateFormatPlaceholders(undefined)).toBeUndefined();
		});

		test('should return empty string for empty string input', () => {
			expect(processDateFormatPlaceholders('')).toBe('');
		});

		test('should return original string if no placeholders are present', () => {
			expect(processDateFormatPlaceholders('folder/subfolder')).toBe('folder/subfolder');
			expect(processDateFormatPlaceholders('note-title')).toBe('note-title');
		});

		test('should leave invalid format placeholders unchanged', () => {
			expect(processDateFormatPlaceholders('{INVALID}')).toBe('{INVALID}');
			expect(processDateFormatPlaceholders('{random text}')).toBe('{random text}');
			expect(processDateFormatPlaceholders('{123}')).toBe('{123}');
			expect(processDateFormatPlaceholders('{abc}')).toBe('{abc}');
		});

		test('should process valid year formats', () => {
			const result = processDateFormatPlaceholders('{YYYY}');
			expect(result).toMatch(/^\d{4}$/); // 4-digit year

			const yearShort = processDateFormatPlaceholders('{YY}');
			expect(yearShort).toMatch(/^\d{2}$/); // 2-digit year
		});

		test('should process valid month formats', () => {
			const result = processDateFormatPlaceholders('{MM}');
			expect(result).toMatch(/^(0[1-9]|1[0-2])$/); // 01-12

			const monthName = processDateFormatPlaceholders('{MMMM}');
			expect(monthName).toMatch(/^(January|February|March|April|May|June|July|August|September|October|November|December)$/);
		});

		test('should process valid day formats', () => {
			const result = processDateFormatPlaceholders('{DD}');
			expect(result).toMatch(/^(0[1-9]|[12][0-9]|3[01])$/); // 01-31

			const dayOfWeek = processDateFormatPlaceholders('{dddd}');
			expect(dayOfWeek).toMatch(/^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)$/);
		});

		test('should process combined date format', () => {
			const result = processDateFormatPlaceholders('{YYYY-MM-DD}');
			expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/); // YYYY-MM-DD format
		});

		test('should process multiple placeholders in one string', () => {
			const result = processDateFormatPlaceholders('folder/{YYYY}/{MM}/{YYYY-MM-DD}');
			expect(result).toMatch(/^folder\/\d{4}\/\d{2}\/\d{4}-\d{2}-\d{2}$/);
		});

		test('should mix processed and unprocessed placeholders', () => {
			const result = processDateFormatPlaceholders('{YYYY}-{INVALID}-{MM}');
			expect(result).toMatch(/^\d{4}-\{INVALID\}-\d{2}$/);
		});

		test('should handle nested braces correctly', () => {
			const result = processDateFormatPlaceholders('{{YYYY}}');
			// The outer braces capture "{YYYY}" which contains braces that aren't valid moment tokens
			// So it should be left unchanged
			expect(result).toBe('{{YYYY}}');
		});

		test('should handle strings with text around placeholders', () => {
			const result = processDateFormatPlaceholders('Daily note {YYYY-MM-DD}.md');
			expect(result).toMatch(/^Daily note \d{4}-\d{2}-\d{2}\.md$/);
		});

		test('should handle hour, minute, second formats', () => {
			const hourResult = processDateFormatPlaceholders('{HH}');
			expect(hourResult).toMatch(/^\d{2}$/); // 00-23

			const minuteResult = processDateFormatPlaceholders('{mm}');
			expect(minuteResult).toMatch(/^\d{2}$/); // 00-59

			const secondResult = processDateFormatPlaceholders('{ss}');
			expect(secondResult).toMatch(/^\d{2}$/); // 00-59
		});

		test('should handle quarter format', () => {
			const result = processDateFormatPlaceholders('{Q}');
			expect(result).toMatch(/^[1-4]$/); // 1-4
		});

		test('should handle week formats', () => {
			const weekResult = processDateFormatPlaceholders('{W}');
			expect(weekResult).toMatch(/^\d{1,2}$/); // 1-53
		});

		test('should handle time with AM/PM', () => {
			const result = processDateFormatPlaceholders('{h:mm A}');
			expect(result).toMatch(/^\d{1,2}:\d{2} (AM|PM)$/);
		});

		test('should handle locale-aware formats', () => {
			const result = processDateFormatPlaceholders('{YYYY-MM-DD, dddd}');
			expect(result).toMatch(/^\d{4}-\d{2}-\d{2}, (Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)$/);
		});
	});
});

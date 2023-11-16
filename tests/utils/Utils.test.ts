import { describe, test, expect } from 'bun:test';
import {
	areArraysEqual,
	arrayStartsWith,
	clamp,
	mod,
	optClamp,
	traverseObjectToParentByPath,
} from '../../src/utils/Utils';
import { remapRange } from '../../src/utils/Utils';

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

describe('traverseObjectToParentByPath function', () => {
	const obj = {
		a: {
			b: {
				c: 1,
				d: 2,
			},
			e: {
				f: 3,
				g: 4,
			},
		},
		h: {
			i: {
				j: 5,
				k: 6,
			},
			l: {
				m: 7,
				n: 8,
			},
		},
	};

	describe('should return the parent and child objects when given a valid path', () => {
		test('a.b.c', () => {
			const result = traverseObjectToParentByPath(['a', 'b', 'c'], obj);
			expect(result.parent.key).toEqual(['a', 'b']);
			expect(result.parent.value).toEqual(obj.a.b);
			expect(result.child.key).toEqual('c');
			expect(result.child.value).toEqual(obj.a.b.c);
		});

		test('h.l.m', () => {
			const result = traverseObjectToParentByPath(['h', 'l', 'm'], obj);
			expect(result.parent.key).toEqual(['h', 'l']);
			expect(result.parent.value).toEqual(obj.h.l);
			expect(result.child.key).toEqual('m');
			expect(result.child.value).toEqual(obj.h.l.m);
		});

		test('a', () => {
			const result = traverseObjectToParentByPath(['a'], obj);
			expect(result.parent.key).toEqual([]);
			expect(result.parent.value).toEqual(obj);
			expect(result.child.key).toEqual('a');
			expect(result.child.value).toEqual(obj.a);
		});
	});

	test('should throw an error when given an empty path', () => {
		expect(() => traverseObjectToParentByPath([], obj)).toThrow('can not traverse to parent on self reference');
	});

	test('should throw an error when given a path that does not exist in the object', () => {
		expect(() => traverseObjectToParentByPath(['a', 'd', 'e'], obj)).toThrow(
			'can not traverse to parent, parent does not exist',
		);
	});

	test("should throw an error when given a path where the parent isn't an object", () => {
		expect(() => traverseObjectToParentByPath(['a', 'b', 'c', 'd'], obj)).toThrow(
			'can not traverse to parent, parent is not an object',
		);
	});
});

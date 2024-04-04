import { describe, expect, test } from 'bun:test';
import {
	isLiteral,
	parseLiteral,
	parseUnknownToFloat,
	parseUnknownToInt,
	parseUnknownToLiteral,
	parseUnknownToLiteralArray,
	parseUnknownToString,
	stringifyLiteral,
	stringifyUnknown,
} from 'packages/core/src/utils/Literal';

describe('parseLiteral function', () => {
	test('should return null when given "null"', () => {
		expect(parseLiteral('null')).toBeNull();
	});

	test('should return true when given "true"', () => {
		expect(parseLiteral('true')).toBe(true);
	});

	test('should return false when given "false"', () => {
		expect(parseLiteral('false')).toBe(false);
	});

	test('should return a number when given a valid number string', () => {
		expect(parseLiteral('123')).toBe(123);
		expect(parseLiteral('-123.45')).toBe(-123.45);
		expect(parseLiteral('0')).toBe(0);
	});

	test('should return the input string when given an invalid number string', () => {
		expect(parseLiteral('abc')).toBe('abc');
		expect(parseLiteral('1.2.3')).toBe('1.2.3');
		expect(parseLiteral('1,000')).toBe('1,000');
	});
});

describe('stringifyLiteral function', () => {
	test('should return empty string when given undefined', () => {
		expect(stringifyLiteral(undefined)).toBe('');
	});

	test('should return empty string when given null', () => {
		expect(stringifyLiteral(null)).toBe('');
	});

	test('should return the input string when given a string', () => {
		expect(stringifyLiteral('hello')).toBe('hello');
		expect(stringifyLiteral('')).toBe('');
	});

	test('should return "true" when given true', () => {
		expect(stringifyLiteral(true)).toBe('true');
	});

	test('should return "false" when given false', () => {
		expect(stringifyLiteral(false)).toBe('false');
	});

	test('should return a string representation of the input number when given a number', () => {
		expect(stringifyLiteral(123)).toBe('123');
		expect(stringifyLiteral(-123.45)).toBe('-123.45');
		expect(stringifyLiteral(0)).toBe('0');
	});
});

describe('isLiteral function', () => {
	test('should return true when given null', () => {
		expect(isLiteral(null)).toBe(true);
	});

	test('should return true when given a string', () => {
		expect(isLiteral('hello')).toBe(true);
	});

	test('should return true when given a boolean', () => {
		expect(isLiteral(true)).toBe(true);
		expect(isLiteral(false)).toBe(true);
	});

	test('should return true when given a number', () => {
		expect(isLiteral(123)).toBe(true);
		expect(isLiteral(-123.45)).toBe(true);
		expect(isLiteral(0)).toBe(true);
	});

	test('should return false when given an object', () => {
		expect(isLiteral({})).toBe(false);
		expect(isLiteral({ foo: 'bar' })).toBe(false);
	});

	test('should return false when given an array', () => {
		expect(isLiteral([])).toBe(false);
		expect(isLiteral([1, 2, 3])).toBe(false);
	});

	test('should return false when given a function', () => {
		expect(isLiteral(() => {})).toBe(false);
	});

	test('should return false when given undefined', () => {
		expect(isLiteral(undefined)).toBe(false);
	});
});

describe('parseUnknownToLiteralArray function', () => {
	test('should return undefined when given undefined', () => {
		expect(parseUnknownToLiteralArray(undefined)).toBeUndefined();
		expect(parseUnknownToLiteralArray(null)).toBeUndefined();
	});

	test('should return an array with one element when given a literal', () => {
		expect(parseUnknownToLiteralArray(true)).toEqual([true]);
		expect(parseUnknownToLiteralArray(false)).toEqual([false]);
		expect(parseUnknownToLiteralArray(123)).toEqual([123]);
		expect(parseUnknownToLiteralArray(-123.45)).toEqual([-123.45]);
		expect(parseUnknownToLiteralArray('hello')).toEqual(['hello']);
	});

	test('should return an array with all literals when given an array with literals', () => {
		expect(parseUnknownToLiteralArray([true, false, 123, -123.45, 'hello', null])).toEqual([
			true,
			false,
			123,
			-123.45,
			'hello',
			null,
		]);
	});

	test('should return an array with only literals when given an array with mixed values', () => {
		expect(
			parseUnknownToLiteralArray([true, false, 123, -123.45, 'hello', null, {}, [], () => {}, undefined]),
		).toEqual([true, false, 123, -123.45, 'hello', null]);
	});

	test('should return undefined when given an object', () => {
		expect(parseUnknownToLiteralArray({})).toBeUndefined();
		expect(parseUnknownToLiteralArray({ foo: 'bar' })).toBeUndefined();
	});

	test('should return undefined when given a function', () => {
		expect(parseUnknownToLiteralArray(() => {})).toBeUndefined();
	});
});

describe('parseUnknownToFloat function', () => {
	test('should return undefined when given undefined', () => {
		expect(parseUnknownToFloat(undefined)).toBeUndefined();
	});

	test('should return undefined when given null', () => {
		expect(parseUnknownToFloat(null)).toBeUndefined();
	});

	test('should return the input number when given a number', () => {
		expect(parseUnknownToFloat(123)).toBe(123);
		expect(parseUnknownToFloat(-123.45)).toBe(-123.45);
		expect(parseUnknownToFloat(0)).toBe(0);
	});

	test('should return a number when given a valid number string', () => {
		expect(parseUnknownToFloat('123')).toBe(123);
		expect(parseUnknownToFloat('-123.45')).toBe(-123.45);
		expect(parseUnknownToFloat('0')).toBe(0);
	});

	test('should return undefined when given an invalid number string', () => {
		expect(parseUnknownToFloat('abc')).toBeUndefined();
		expect(parseUnknownToFloat('1.2.3')).toBeUndefined();
		expect(parseUnknownToFloat('1,000')).toBeUndefined();
	});

	test('should return undefined when given a boolean', () => {
		expect(parseUnknownToFloat(true)).toBeUndefined();
		expect(parseUnknownToFloat(false)).toBeUndefined();
	});

	test('should return undefined when given an object', () => {
		expect(parseUnknownToFloat({})).toBeUndefined();
		expect(parseUnknownToFloat({ foo: 'bar' })).toBeUndefined();
	});

	test('should return undefined when given an array', () => {
		expect(parseUnknownToFloat([])).toBeUndefined();
		expect(parseUnknownToFloat([1, 2, 3])).toBeUndefined();
	});

	test('should return undefined when given a function', () => {
		expect(parseUnknownToFloat(() => {})).toBeUndefined();
	});
});

describe('parseUnknownToInt function', () => {
	test('should return undefined when given undefined', () => {
		expect(parseUnknownToInt(undefined)).toBeUndefined();
	});

	test('should return undefined when given null', () => {
		expect(parseUnknownToInt(null)).toBeUndefined();
	});

	test('should return the input number when given an integer', () => {
		expect(parseUnknownToInt(123)).toBe(123);
		expect(parseUnknownToInt(-123)).toBe(-123);
		expect(parseUnknownToInt(0)).toBe(0);
	});

	test('should return the input number when given a float with no decimal places', () => {
		expect(parseUnknownToInt(123.0)).toBe(123);
		expect(parseUnknownToInt(-123.0)).toBe(-123);
		expect(parseUnknownToInt(0.0)).toBe(0);
	});

	test('should return undefined when given a float with decimal places', () => {
		expect(parseUnknownToInt(123.45)).toBeUndefined();
		expect(parseUnknownToInt(-123.45)).toBeUndefined();
		expect(parseUnknownToInt(0.1)).toBeUndefined();
	});

	test('should return a number when given a valid integer string', () => {
		expect(parseUnknownToInt('123')).toBe(123);
		expect(parseUnknownToInt('-123')).toBe(-123);
		expect(parseUnknownToInt('0')).toBe(0);
	});

	test('should return undefined when given an invalid integer string', () => {
		expect(parseUnknownToInt('abc')).toBeUndefined();
		expect(parseUnknownToInt('1.2.3')).toBeUndefined();
		expect(parseUnknownToInt('1,000')).toBeUndefined();
	});

	test('should return undefined when given a boolean', () => {
		expect(parseUnknownToInt(true)).toBeUndefined();
		expect(parseUnknownToInt(false)).toBeUndefined();
	});

	test('should return undefined when given an object', () => {
		expect(parseUnknownToInt({})).toBeUndefined();
		expect(parseUnknownToInt({ foo: 'bar' })).toBeUndefined();
	});

	test('should return undefined when given an array', () => {
		expect(parseUnknownToInt([])).toBeUndefined();
		expect(parseUnknownToInt([1, 2, 3])).toBeUndefined();
	});

	test('should return undefined when given a function', () => {
		expect(parseUnknownToInt(() => {})).toBeUndefined();
	});
});

describe('parseUnknownToString function', () => {
	test('should return undefined when given undefined', () => {
		expect(parseUnknownToString(undefined)).toBeUndefined();
	});

	test('should return the input string when given a string', () => {
		expect(parseUnknownToString('hello')).toBe('hello');
		expect(parseUnknownToString('')).toBe('');
	});

	test('should return "true" when given true', () => {
		expect(parseUnknownToString(true)).toBe('true');
	});

	test('should return "false" when given false', () => {
		expect(parseUnknownToString(false)).toBe('false');
	});

	test('should return a string representation of the input number when given a number', () => {
		expect(parseUnknownToString(123)).toBe('123');
		expect(parseUnknownToString(-123.45)).toBe('-123.45');
		expect(parseUnknownToString(0)).toBe('0');
	});

	test('should return empty string when given null', () => {
		expect(parseUnknownToString(null)).toBe('');
	});

	test('should return undefined when given an object', () => {
		expect(parseUnknownToString({})).toBeUndefined();
		expect(parseUnknownToString({ foo: 'bar' })).toBeUndefined();
	});

	test('should return undefined when given an array', () => {
		expect(parseUnknownToString([])).toBeUndefined();
		expect(parseUnknownToString([1, 2, 3])).toBeUndefined();
	});

	test('should return undefined when given a function', () => {
		expect(parseUnknownToString(() => {})).toBeUndefined();
	});
});

describe('parseUnknownToLiteral function', () => {
	test('should return undefined when given undefined', () => {
		expect(parseUnknownToLiteral(undefined)).toBeUndefined();
	});

	test('should return the input literal when given a literal', () => {
		expect(parseUnknownToLiteral(true)).toBe(true);
		expect(parseUnknownToLiteral(false)).toBe(false);
		expect(parseUnknownToLiteral(123)).toBe(123);
		expect(parseUnknownToLiteral(-123.45)).toBe(-123.45);
		expect(parseUnknownToLiteral('hello')).toBe('hello');
		expect(parseUnknownToLiteral(null)).toBeNull();
	});

	test('should return undefined when given an object', () => {
		expect(parseUnknownToLiteral({})).toBeUndefined();
		expect(parseUnknownToLiteral({ foo: 'bar' })).toBeUndefined();
	});

	test('should return undefined when given an array', () => {
		expect(parseUnknownToLiteral([])).toBeUndefined();
		expect(parseUnknownToLiteral([1, 2, 3])).toBeUndefined();
	});

	test('should return undefined when given a function', () => {
		expect(parseUnknownToLiteral(() => {})).toBeUndefined();
	});
});

describe('stringifyUnknown function', () => {
	test('should return empty string when given null or undefined and nullAsEmpty is true', () => {
		expect(stringifyUnknown(null, true)).toBe('');
		expect(stringifyUnknown(undefined, true)).toBe('');
	});

	test('should return "null" when given null or undefined and nullAsEmpty is false', () => {
		expect(stringifyUnknown(null, false)).toBe('null');
		expect(stringifyUnknown(undefined, false)).toBe('null');
	});

	test('should return the input string when given a string', () => {
		expect(stringifyUnknown('hello', false)).toBe('hello');
		expect(stringifyUnknown('', false)).toBe('');
	});

	test('should return "true" when given true', () => {
		expect(stringifyUnknown(true, false)).toBe('true');
	});

	test('should return "false" when given false', () => {
		expect(stringifyUnknown(false, false)).toBe('false');
	});

	test('should return a string representation of the input number when given a number', () => {
		expect(stringifyUnknown(123, false)).toBe('123');
		expect(stringifyUnknown(-123.45, false)).toBe('-123.45');
		expect(stringifyUnknown(0, false)).toBe('0');
	});

	test('should return a string representation of each element when given an array of numbers', () => {
		expect(stringifyUnknown([1, 2, 3], false)).toBe('1, 2, 3');
		expect(stringifyUnknown([-1, -2, -3], false)).toBe('-1, -2, -3');
		expect(stringifyUnknown([0, 0, 0], false)).toBe('0, 0, 0');
	});

	test('should return a comma-separated list of stringified literals when given an array with nullAsEmpty false', () => {
		expect(stringifyUnknown([true, false, 123, -123.45, 'hello', null], false)).toBe(
			'true, false, 123, -123.45, hello, null',
		);
	});

	test('should return a comma-separated list of stringified literals when given an array with nullAsEmpty true', () => {
		expect(stringifyUnknown([true, false, 123, -123.45, 'hello', null], true)).toBe(
			'true, false, 123, -123.45, hello',
		);
	});

	test('should return a comma-separated list of stringified literals when given an array of mixed values', () => {
		expect(stringifyUnknown([true, false, 123, -123.45, 'hello', null, {}, [], () => {}, undefined], false)).toBe(
			'true, false, 123, -123.45, hello, null, {}, [], <function>, null',
		);
	});

	test('should return JSON representation when given an object', () => {
		expect(stringifyUnknown({}, false)).toBe(JSON.stringify({}));
		expect(stringifyUnknown({ foo: 'bar' }, false)).toBe(JSON.stringify({ foo: 'bar' }));
	});

	test('should return undefined when given a function', () => {
		expect(stringifyUnknown(() => {}, false)).toBe('<function>');
	});
});

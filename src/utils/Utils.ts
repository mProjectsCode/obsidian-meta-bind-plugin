import { traverseObjectByPath } from '@opd-libs/opd-utils-lib/lib/ObjectTraversalUtils';
import { KeyValuePair } from '@opd-libs/opd-utils-lib/lib/Utils';
import structuredClone from '@ungap/structured-clone';
import { P_UTILS } from '@lemons_dev/parsinom/lib/ParserUtils';
import { P } from '@lemons_dev/parsinom/lib/ParsiNOM';
import { Parser } from '@lemons_dev/parsinom/lib/Parser';

if (!('structuredClone' in globalThis)) {
	// @ts-ignore
	globalThis.structuredClone = structuredClone;
}

/**
 * Gets the file name from a path
 *
 * @param path
 */
export function getFileName(path: string): string {
	return path.split('/').at(-1) ?? path;
}

/**
 * Checks if a path is a path or a file name
 *
 * @param path
 */
export function isPath(path: string): boolean {
	return path.split('/').length > 1;
}

/**
 * Removes the file ending of a file name
 *
 * @param fileName
 */
export function removeFileEnding(fileName: string): string {
	const fileNameParts = fileName.split('.');
	if (fileNameParts.length === 1) {
		return fileName;
	} else {
		let newFileName = fileNameParts[0];
		for (let i = 1; i < fileNameParts.length - 1; i++) {
			newFileName += '.' + fileNameParts[i];
		}
		return newFileName;
	}
}

/**
 * Clamp, unused
 *
 * @param num
 * @param min
 * @param max
 */
export function clamp(num: number, min: number, max: number): number {
	return Math.min(Math.max(num, min), max);
}

export function remapRange(old_value: number, old_min: number, old_max: number, new_min: number, new_max: number): number {
	return ((old_value - old_min) / (old_max - old_min)) * (new_max - new_min) + new_min;
}

/**
 * js can't even implement modulo correctly...
 *
 * @param n
 * @param m
 */
export function mod(n: number, m: number): number {
	return ((n % m) + m) % m;
}

/**
 * Checks if 2 arrays contain equal values, the arrays should have the same datatype. Order of the elements matters.
 *
 * @param arr1
 * @param arr2
 */
export function areArraysEqual<T>(arr1: T[] | undefined, arr2: T[] | undefined): boolean {
	if (arr1 == null && arr2 == null) {
		return true;
	}
	if (arr1 == null || arr2 == null) {
		return false;
	}

	if (arr1.length !== arr2.length) {
		return false;
	}

	for (let i = 0; i < arr1.length; i++) {
		if (arr1[i] !== arr2[i]) {
			return false;
		}
	}

	return true;
}

/**
 * Checks if 2 arrays are equal, the arrays should have the same datatype
 *
 * @param arr1
 * @param arr2
 *
 * @returns true if the two arrays are equal
 */
export function arrayEquals<T>(arr1: T[], arr2: T[]): boolean {
	if (arr1.length !== arr2.length) {
		return false;
	}

	for (let i = 0; i < arr1.length; i++) {
		if (arr1[i] !== arr2[i]) {
			return false;
		}
	}

	return true;
}

/**
 * Checks if arr starts with base.
 *
 * @param arr
 * @param base
 */
export function arrayStartsWith<T>(arr: T[], base: T[]): boolean {
	for (let i = 0; i < base.length; i++) {
		if (arr[i] !== base[i]) {
			return false;
		}
	}

	return true;
}

export function isTruthy(value: any): boolean {
	return !!value;
}

export function isFalsy(value: any): boolean {
	return !value;
}

export function equalOrIncludes(str1: string, str2: string): boolean {
	return str1 === str2 || str1.includes(str2) || str2.includes(str1);
}

export function numberToString(n: number | string): string {
	return n + '';
}

export function traverseObjectToParentByPath(pathParts: string[], o: any): { parent: KeyValuePair<string[], any>; child: KeyValuePair<string, any> } {
	if (pathParts[0] === '') {
		throw new Error('can not traverse to parent on self reference');
	}

	const parentPath = pathParts.slice(0, -1);
	const childKey: string = pathParts.at(-1) ?? '';
	const parentObject = traverseObjectByPath(parentPath, o);

	return {
		parent: { key: parentPath, value: parentObject },
		child: { key: childKey, value: parentObject[childKey] },
	};
}

export function pathJoin(path1: string, path2: string): string {
	if (path1 == null) {
		throw new Error('path1 must not be null');
	}

	if (path2 == null) {
		throw new Error('path2 must not be null');
	}

	path1 = path1.replaceAll('\\', '/');
	path2 = path2.replaceAll('\\', '/');

	let result: string;

	if (path1.endsWith('/') && path2.startsWith('/')) {
		result = path1 + path2.substring(1);
	} else if (path1.endsWith('/') && !path2.startsWith('/')) {
		result = path1 + path2;
	} else if (!path1.endsWith('/') && path2.startsWith('/')) {
		result = path1 + path2;
	} else {
		result = path1 + '/' + path2;
	}

	if (result.startsWith('/') && result.endsWith('/')) {
		return result.substring(1, result.length - 1);
	} else if (result.startsWith('/')) {
		return result.substring(1);
	} else if (result.endsWith('/')) {
		return result.substring(0, result.length - 1);
	} else {
		return result;
	}
}

export function imagePathToUri(imagePath: string): string {
	// return `app://local/${pathJoin(getVaultBasePath() ?? '', imagePath)}`;
	return app.vault.adapter.getResourcePath(imagePath);
}

export function isObject(object: unknown): boolean {
	return object != null && typeof object === 'object';
}

export function deepEquals(any1: unknown, any2: unknown): boolean {
	// undefined check
	if (any1 === undefined && any2 === undefined) {
		return true;
	} else if (any1 === undefined) {
		return false;
	} else if (any2 === undefined) {
		return false;
	}

	// null check
	if (any1 === null && any2 === null) {
		return true;
	} else if (any1 === null) {
		return false;
	} else if (any2 === null) {
		return false;
	}

	if (typeof any1 === 'object' && typeof any2 === 'object') {
		// array check
		if (Array.isArray(any1) && Array.isArray(any2)) {
			if (any1.length !== any2.length) {
				return false;
			}

			for (let i = 0; i < any1.length; i++) {
				if (!deepEquals(any1[i], any2[i])) {
					return false;
				}
			}

			return true;
		} else if (Array.isArray(any1)) {
			return false;
		} else if (Array.isArray(any2)) {
			return false;
		}

		const objKeys1 = Object.keys(any1);
		const objKeys2 = Object.keys(any2);

		if (objKeys1.length !== objKeys2.length) {
			return false;
		}

		for (const key of objKeys1) {
			// @ts-ignore
			if (!deepEquals(any1[key], any2[key])) {
				return false;
			}
		}

		return true;
	} else if (typeof any1 === 'object') {
		return false;
	} else if (typeof any2 === 'object') {
		return false;
	}

	return any1 === any2;
}

export function deepFreeze<T extends object>(object: T): Readonly<T> {
	// Retrieve the property names defined on object
	const propNames: (string | symbol)[] = Reflect.ownKeys(object);

	// Freeze properties before freezing self
	for (const name of propNames) {
		// @ts-ignores
		const value: any = object[name];

		if ((value && typeof value === 'object') || typeof value === 'function') {
			deepFreeze(value);
		}
	}

	return Object.freeze(object);
}

export function deepCopy<T extends object>(object: T): T {
	return structuredClone(object);
}

export type MBLiteral = string | number | boolean | null;
export type MBExtendedLiteral = MBLiteral | MBLiteral[];

const numberParser: Parser<number> = P.sequenceMap(
	(sign, number) => (sign === undefined ? number : -number),
	P.string('-').optional(),
	P.or(
		P.sequenceMap((a, b, c) => Number(a + b + c), P_UTILS.digits(), P.string('.'), P_UTILS.digits()),
		P_UTILS.digits().map(x => Number(x))
	)
).thenEof();

export function parseLiteral(literalString: string): MBLiteral {
	if (literalString.toLowerCase() === 'null') {
		return null;
	} else if (literalString === 'true') {
		return true;
	} else if (literalString === 'false') {
		return false;
	} else {
		const parseResult = numberParser.tryParse(literalString);

		if (parseResult.success) {
			return parseResult.value;
		} else {
			return literalString;
		}
	}
}

export function stringifyLiteral(literal: MBExtendedLiteral | undefined): string {
	if (literal === undefined) {
		return '';
	}

	if (literal === null) {
		return 'null';
	}

	if (typeof literal === 'string') {
		return literal;
	} else if (typeof literal === 'boolean') {
		return literal ? 'true' : 'false';
	} else {
		// typeof number
		return literal.toString();
	}
}

export function isLiteral(literal: unknown): literal is MBLiteral {
	return literal === null || typeof literal === 'string' || typeof literal === 'boolean' || typeof literal === 'number';
}

import { FileSystemAdapter } from 'obsidian';
import { traverseObjectByPath } from '@opd-libs/opd-utils-lib/lib/ObjectTraversalUtils';
import { KeyValuePair } from '@opd-libs/opd-utils-lib/lib/Utils';

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
 * Checks if 2 arrays contain equal values, the arrays should have the same datatype
 *
 * @param arr1
 * @param arr2
 */
export function doArraysContainEqualValues<T>(arr1: T[], arr2: T[]): boolean {
	if (arr1 == null && arr2 == null) {
		return true;
	}
	if (arr1 == null || arr2 == null) {
		return false;
	}

	if (arr1.length !== arr2.length) {
		return false;
	}

	for (const arr1Element of arr1) {
		if (!arr2.contains(arr1Element)) {
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

export function getVaultBasePath(): string | null {
	const adapter = app.vault.adapter;
	if (adapter instanceof FileSystemAdapter) {
		return adapter.getBasePath();
	}
	return null;
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

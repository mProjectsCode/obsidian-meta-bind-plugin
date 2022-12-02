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
 * Checks if 2 arrays are equal, the arrays should have the same datatype
 *
 * @param arr1
 * @param arr2
 */
export function arrayEquals(arr1: any[], arr2: any[]): boolean {
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

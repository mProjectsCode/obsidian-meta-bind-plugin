/**
 * Gets the file name from a path
 *
 * @param path
 */
export function getFileName(path: string) {
	return path.split('/').at(-1);
}

/**
 * Checks if a path is a path or a file name
 *
 * @param path
 */
export function isPath(path: string) {
	return path.split('/').length > 1;
}

/**
 * Removes the file ending of a file name
 *
 * @param fileName
 */
export function removeFileEnding(fileName: string) {
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
export function arrayEquals(arr1: any[], arr2: any[]) {
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
 * Template "engine" from my media db plugin
 *
 * @param template
 * @param dataModel
 */
export function replaceTags(template: string, dataModel: any): string {
	const resolvedTemplate = template.replace(new RegExp('{{.*?}}', 'g'), (match: string) => replaceTag(match, dataModel));

	return resolvedTemplate;
}

/**
 * Takes in a template match and returns the replacement data
 *
 * @param match
 * @param dataModel
 */
function replaceTag(match: string, dataModel: any): string {
	let tag = match;
	tag = tag.substring(2);
	tag = tag.substring(0, tag.length - 2);
	tag = tag.trim();

	let parts = tag.split(':');
	if (parts.length === 1) {
		let path = parts[0].split('.');

		let obj = traverseObject(path, dataModel);

		if (obj === undefined) {
			return '{{ INVALID TEMPLATE TAG - object undefined }}';
		}

		return obj;
	} else if (parts.length === 2) {
		let operator = parts[0];

		let path = parts[1].split('.');

		let obj = traverseObject(path, dataModel);

		if (obj === undefined) {
			return '{{ INVALID TEMPLATE TAG - object undefined }}';
		}

		if (operator === 'LIST') {
			if (!Array.isArray(obj)) {
				return '{{ INVALID TEMPLATE TAG - operator LIST is only applicable on an array }}';
			}
			return obj.map((e: any) => `- ${e}`).join('\n');
		} else if (operator === 'ENUM') {
			if (!Array.isArray(obj)) {
				return '{{ INVALID TEMPLATE TAG - operator ENUM is only applicable on an array }}';
			}
			return obj.join(', ');
		}

		return `{{ INVALID TEMPLATE TAG - unknown operator ${operator} }}`;
	}

	return '{{ INVALID TEMPLATE TAG }}';
}

/**
 * Traverses the object along a property path
 *
 * @param path
 * @param obj
 */
function traverseObject(path: Array<string>, obj: any): any {
	for (let part of path) {
		if (obj !== undefined) {
			obj = obj[part];
		}
	}

	return obj;
}

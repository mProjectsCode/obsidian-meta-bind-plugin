export function getFileName(path: string) {
	return path.split('/').at(-1);
}

export function isPath(path: string) {
	return path.split('/').length > 1;
}

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

export function clamp(num: number, min: number, max: number): number {
	return Math.min(Math.max(num, min), max);
}


// js can't even implement modulo correctly...
export function mod(n: number, m: number): number {
	return ((n % m) + m) % m;
}

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

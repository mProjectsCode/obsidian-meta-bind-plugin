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

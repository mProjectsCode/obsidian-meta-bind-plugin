export class TestFileSystem {
	files: Map<string, string>;

	constructor() {
		this.files = new Map();
	}

	readFile(path: string): string {
		this.validateFilePath(path);

		let fileContent = this.files.get(path);
		if (fileContent === undefined) {
			throw new Error(`File not found: ${path}`);
		}
		return fileContent;
	}

	writeFile(path: string, content: string): void {
		this.validateFilePath(path);

		this.files.set(path, content);
	}

	deleteFile(path: string): void {
		this.validateFilePath(path);

		if (!this.fileExists(path)) {
			throw new Error(`File does not exist: ${path}`);
		}

		this.files.delete(path);
	}

	listFiles(): string[] {
		return Array.from(this.files.keys());
	}

	fileExists(path: string): boolean {
		this.validateFilePath(path);

		return this.files.has(path);
	}

	listDirs(): string[] {
		const dirs = new Set<string>();

		for (const path of this.files.keys()) {
			const parts = path.split('/');
			parts.pop();
			dirs.add(parts.join('/'));
		}

		return Array.from(dirs);
	}

	validateFilePath(path: string): void {
		if (path === '') {
			throw new Error('Invalid file path');
		}

		const parts = path.split('/');

		for (const part of parts) {
			if (part === '' || part === '.' || part === '..') {
				throw new Error('Invalid file path');
			}
		}
	}
}

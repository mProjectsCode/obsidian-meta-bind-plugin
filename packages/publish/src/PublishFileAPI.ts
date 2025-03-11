import { FileAPI } from 'packages/core/src/api/FileAPI';
import type { PublishComponents } from 'packages/publish/src/main';

export class PublishFileAPI extends FileAPI<PublishComponents> {
	public read(_filePath: string): Promise<string> {
		throw new Error('Reading files is not supported in Obsidian Publish.');
	}

	public write(_filePath: string, _content: string): Promise<void> {
		throw new Error('Writing files is not supported in Obsidian Publish.');
	}

	public exists(filePath: string): Promise<boolean> {
		return Promise.resolve(this.getAllFiles().contains(filePath));
	}

	public atomicModify(_filePath: string, _modify: (content: string) => string): Promise<void> {
		throw new Error('Modifying files is not supported in Obsidian Publish.');
	}

	public create(_folderPath: string, _fileName: string, _extension: string, _open?: boolean): Promise<string> {
		throw new Error('Creating files is not supported in Obsidian Publish.');
	}

	public getAllFiles(): string[] {
		return Object.keys(publish.site.cache);
	}

	public getAllFolders(): string[] {
		const filePaths = this.getAllFiles();

		const folders = new Set<string>();

		for (const filePath of filePaths) {
			const parts = filePath.split('/');
			parts.pop();
			folders.add(parts.join('/'));
		}

		return Array.from(folders);
	}

	public open(_filePath: string, _callingFilePath: string, _newTab: boolean): Promise<void> {
		throw new Error('not implemented');
	}

	public getPathByName(name: string, _relativeTo?: string): string | undefined {
		return name;
	}
}

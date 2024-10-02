import type { App } from 'obsidian';
import { normalizePath, TFile, TFolder } from 'obsidian';
import { FileAPI } from 'packages/core/src/api/FileAPI';
import type MetaBindPlugin from 'packages/obsidian/src/main';

export class ObsidianFileAPI extends FileAPI<MetaBindPlugin> {
	readonly app: App;

	constructor(plugin: MetaBindPlugin) {
		super(plugin);
		this.app = plugin.app;
	}

	public async read(filePath: string): Promise<string> {
		const tFile = this.app.vault.getAbstractFileByPath(filePath);
		if (!tFile || !(tFile instanceof TFile)) {
			throw new Error(`file not found: ${filePath}`);
		}

		return this.app.vault.cachedRead(tFile);
	}

	public async write(filePath: string, content: string): Promise<void> {
		const tFile = this.app.vault.getFileByPath(filePath);
		if (!tFile) {
			throw new Error(`file not found: ${filePath}`);
		}
		await this.app.vault.modify(tFile, content);
	}

	public async exists(filePath: string): Promise<boolean> {
		return this.app.vault.getFileByPath(filePath) !== null;
	}

	public async atomicModify(filePath: string, modify: (content: string) => string): Promise<void> {
		const tFile = this.app.vault.getFileByPath(filePath);
		if (!tFile) {
			throw new Error(`file not found: ${filePath}`);
		}

		await this.app.vault.process(tFile, content => modify(content));
	}

	public async create(folderPath: string, fileName: string, extension: string, open?: boolean): Promise<string> {
		const path = this.app.vault.getAvailablePath(normalizePath(folderPath + '/' + fileName), extension);
		const newFile = await this.app.vault.create(path, '');

		if (open) {
			const activeLeaf = this.app.workspace.getLeaf(false);
			if (activeLeaf) {
				await activeLeaf.openFile(newFile, {
					state: { mode: 'source' },
				});
			}
		}

		return newFile.path;
	}

	public getAllFiles(): string[] {
		return this.app.vault
			.getAllLoadedFiles()
			.filter(file => file instanceof TFile)
			.map(file => file.path);
	}

	public getAllFolders(): string[] {
		return this.app.vault
			.getAllLoadedFiles()
			.filter(file => file instanceof TFolder)
			.map(file => file.path);
	}

	public open(filePath: string, callingFilePath: string, newTab: boolean): void {
		void this.app.workspace.openLinkText(filePath, callingFilePath, newTab);
	}

	public getPathByName(name: string, relativeTo: string = ''): string | undefined {
		return this.app.metadataCache.getFirstLinkpathDest(name, relativeTo)?.path;
	}
}

import { type IMetadataAdapter } from './IMetadataAdapter';
import { type Metadata, type MetadataManagerCacheItem } from './MetadataManagerCacheItem';
import type MetaBindPlugin from '../main';
import { type App, TFile } from 'obsidian';
import { ErrorLevel, MetaBindBindTargetError } from '../utils/errors/MetaBindErrors';
import { type MetadataManager } from './MetadataManager';
import { type IMetadataSubscription } from './IMetadataSubscription';

export interface ObsidianMetadataAdapterExtraCache {
	file: TFile;
}

export class ObsidianMetadataAdapter implements IMetadataAdapter {
	app: App;
	plugin: MetaBindPlugin;

	manager: MetadataManager | undefined;
	interval: number | undefined;

	constructor(plugin: MetaBindPlugin) {
		this.app = plugin.app;
		this.plugin = plugin;
	}

	public getMetadataAndExtraCache(subscription: IMetadataSubscription): { extraCache: { file: TFile }; metadata: Metadata } {
		if (subscription.bindTarget === undefined) {
			throw new MetaBindBindTargetError(ErrorLevel.CRITICAL, 'can not get metadata and extra cache', 'subscription bind target undefined');
		}

		const file = this.plugin.app.vault.getAbstractFileByPath(subscription.bindTarget.filePath);
		if (!(file instanceof TFile)) {
			throw new MetaBindBindTargetError(ErrorLevel.CRITICAL, 'can not get metadata and extra cache', 'bind target file path does not point to a tFile');
		}

		const frontmatter = this.plugin.app.metadataCache.getFileCache(file)?.frontmatter;

		return { extraCache: { file: file } satisfies ObsidianMetadataAdapterExtraCache, metadata: structuredClone(frontmatter) ?? {} };
	}

	public setManagerInstance(manager: MetadataManager): void {
		this.manager = manager;
	}

	public async updateMetadata(_: string, fileCache: MetadataManagerCacheItem): Promise<void> {
		const file = (fileCache.extraCache as ObsidianMetadataAdapterExtraCache).file;

		await this.plugin.app.fileManager.processFrontMatter(file, frontMatter => {
			fileCache.changed = false;
			Object.assign(frontMatter, fileCache.metadata);
		});
	}

	public load(): void {
		this.plugin.registerEvent(
			this.plugin.app.metadataCache.on('changed', (file, _, cache) => {
				this.manager?.updateCacheOnExternalUpdate(file.path, cache.frontmatter ?? {});
			}),
		);

		if (this.manager !== undefined) {
			this.interval = window.setInterval(() => this.manager?.update(), this.plugin.settings.syncInterval);
		}
	}

	public unload(): void {
		if (this.interval !== undefined) {
			window.clearInterval(this.interval);
		}
	}
}

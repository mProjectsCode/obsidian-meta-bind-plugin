import { type FilePathMetadataCacheItem } from './MetadataCacheItem';
import { TFile } from 'obsidian';
import { FilePathMetadataSource } from './MetadataSource';
import type MetaBindPlugin from '../main';
import { type MetadataManager } from './MetadataManager';
import { ErrorLevel, MetaBindInternalError } from '../utils/errors/MetaBindErrors';

interface ObsidianMetadataCacheItem extends FilePathMetadataCacheItem {
	file: TFile;
}

export class ObsidianMetadataSource extends FilePathMetadataSource<ObsidianMetadataCacheItem> {
	public readonly plugin: MetaBindPlugin;

	constructor(plugin: MetaBindPlugin, id: string, manager: MetadataManager) {
		super(id, manager);
		this.plugin = plugin;

		this.plugin.registerEvent(
			this.plugin.app.metadataCache.on('changed', (file, _data, cache) => {
				this.manager.onExternalUpdate(this, file.path, structuredClone(cache.frontmatter) ?? {});
			}),
		);
	}

	getDefaultCacheItem(storagePath: string): ObsidianMetadataCacheItem {
		const file = this.plugin.app.vault.getAbstractFileByPath(storagePath);

		if (file == null || !(file instanceof TFile)) {
			throw new MetaBindInternalError({
				errorLevel: ErrorLevel.CRITICAL,
				effect: 'can not get default cache item',
				cause: `no file for path "${storagePath}" found or path is not a file`,
			});
		}

		const frontmatter = this.plugin.app.metadataCache.getFileCache(file)?.frontmatter;

		// TODO: remove
		console.log('meta-bind | Obs Source >> default cache', structuredClone(frontmatter), storagePath);

		return {
			data: structuredClone(frontmatter) ?? {},
			storagePath: storagePath,
			file: file,
			...this.manager.getDefaultCacheItem(),
		};
	}

	async syncExternal(cacheItem: ObsidianMetadataCacheItem): Promise<void> {
		await this.plugin.app.fileManager.processFrontMatter(cacheItem.file, frontmatter => {
			Object.assign(frontmatter, cacheItem.data);
		});
	}
}

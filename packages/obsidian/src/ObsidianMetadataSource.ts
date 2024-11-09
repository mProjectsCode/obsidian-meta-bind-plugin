import { TFile } from 'obsidian';
import type { FilePathMetadataCacheItem } from 'packages/core/src/metadata/MetadataCacheItem';
import type { MetadataManager } from 'packages/core/src/metadata/MetadataManager';
import type { Metadata } from 'packages/core/src/metadata/MetadataSource';
import { FilePathMetadataSource } from 'packages/core/src/metadata/MetadataSource';
import { ErrorLevel, MetaBindInternalError } from 'packages/core/src/utils/errors/MetaBindErrors';
import type MetaBindPlugin from 'packages/obsidian/src/main';

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

	public readExternal(storagePath: string): Metadata {
		const file = this.plugin.app.vault.getAbstractFileByPath(storagePath);

		if (file == null || !(file instanceof TFile)) {
			throw new MetaBindInternalError({
				errorLevel: ErrorLevel.CRITICAL,
				effect: 'can not get default cache item',
				cause: `no file for path "${storagePath}" found or path is not a file`,
			});
		}

		const frontmatter = this.plugin.app.metadataCache.getFileCache(file)?.frontmatter;

		return structuredClone(frontmatter) ?? {};
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

		MB_DEBUG &&
			console.log('meta-bind | Obs Source >> loaded frontmatter', structuredClone(frontmatter), storagePath);

		return {
			data: structuredClone(frontmatter) ?? {},
			storagePath: storagePath,
			file: file,
			...this.manager.getDefaultCacheItem(),
		};
	}

	// getTags(file: TFile): string[] {
	// 	const cache = this.plugin.app.metadataCache.getFileCache(file);
	// 	if (!cache) {
	// 		return [];
	// 	}

	// 	const tags = cache.tags?.map(x => x.tag.substring(1)) ?? [];

	// 	const frontmatterTags = cache.frontmatter?.tags as string | string[] | undefined;
	// 	if (frontmatterTags) {
	// 		if (Array.isArray(frontmatterTags)) {
	// 			tags.push(...frontmatterTags);
	// 		} else {
	// 			tags.push(frontmatterTags);
	// 		}
	// 	}

	// 	return Array.from(new Set(tags));
	// }

	syncExternal(cacheItem: ObsidianMetadataCacheItem): void {
		void this.plugin.app.fileManager.processFrontMatter(cacheItem.file, frontmatter => {
			Object.assign(frontmatter, cacheItem.data);
		});
	}
}

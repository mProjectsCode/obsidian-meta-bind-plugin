import { TFile } from 'obsidian';
import type { FilePathMetadataCacheItem } from 'packages/core/src/metadata/MetadataCacheItem';
import type { MetadataManager } from 'packages/core/src/metadata/MetadataManager';
import type { Metadata } from 'packages/core/src/metadata/MetadataSource';
import { FilePathMetadataSource } from 'packages/core/src/metadata/MetadataSource';
import { ErrorLevel, MetaBindInternalError } from 'packages/core/src/utils/errors/MetaBindErrors';
import type { ObsMetaBind } from 'packages/obsidian/src/main';

interface ObsMetadataCacheItem extends FilePathMetadataCacheItem {
	file: TFile;
}

export class ObsMetadataSource extends FilePathMetadataSource<ObsMetadataCacheItem> {
	public readonly mb: ObsMetaBind;

	constructor(mb: ObsMetaBind, id: string, manager: MetadataManager) {
		super(id, manager);
		this.mb = mb;

		this.mb.plugin.registerEvent(
			this.mb.app.metadataCache.on('changed', (file, _data, cache) => {
				this.manager.onExternalUpdate(this, file.path, structuredClone(cache.frontmatter) ?? {});
			}),
		);
	}

	public readExternal(storagePath: string): Metadata {
		const file = this.mb.app.vault.getAbstractFileByPath(storagePath);

		if (file == null || !(file instanceof TFile)) {
			throw new MetaBindInternalError({
				errorLevel: ErrorLevel.CRITICAL,
				effect: 'can not get default cache item',
				cause: `no file for path "${storagePath}" found or path is not a file`,
			});
		}

		const frontmatter = this.mb.app.metadataCache.getFileCache(file)?.frontmatter;

		return structuredClone(frontmatter) ?? {};
	}

	getDefaultCacheItem(storagePath: string): ObsMetadataCacheItem {
		const file = this.mb.app.vault.getAbstractFileByPath(storagePath);

		if (file == null || !(file instanceof TFile)) {
			throw new MetaBindInternalError({
				errorLevel: ErrorLevel.CRITICAL,
				effect: 'can not get default cache item',
				cause: `no file for path "${storagePath}" found or path is not a file`,
			});
		}

		const frontmatter = this.mb.app.metadataCache.getFileCache(file)?.frontmatter;

		MB_DEBUG &&
			console.log('meta-bind | Obs Source >> loaded frontmatter', structuredClone(frontmatter), storagePath);

		return {
			data: structuredClone(frontmatter) ?? {},
			storagePath: storagePath,
			file: file,
			...this.manager.constructDefaultCacheItem(),
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

	async syncExternal(cacheItem: ObsMetadataCacheItem): Promise<void> {
		return this.mb.app.fileManager.processFrontMatter(cacheItem.file, frontmatter => {
			Object.assign(frontmatter, cacheItem.data);
		});
	}
}

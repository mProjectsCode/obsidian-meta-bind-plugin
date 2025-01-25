import type { FilePathMetadataCacheItem } from 'packages/core/src/metadata/MetadataCacheItem';
import type { MetadataManager } from 'packages/core/src/metadata/MetadataManager';
import type { Metadata } from 'packages/core/src/metadata/MetadataSource';
import { FilePathMetadataSource } from 'packages/core/src/metadata/MetadataSource';
import type { MetaBindPublishPlugin } from 'packages/publish/src/main';

export class PublishMetadataSource extends FilePathMetadataSource<FilePathMetadataCacheItem> {
	public readonly plugin: MetaBindPublishPlugin;

	constructor(plugin: MetaBindPublishPlugin, id: string, manager: MetadataManager) {
		super(id, manager);
		this.plugin = plugin;
	}

	public readExternal(storagePath: string): Metadata {
		const frontmatter = publish.site.cache.cache[storagePath]?.frontmatter;

		return structuredClone(frontmatter) ?? {};
	}

	getDefaultCacheItem(storagePath: string): FilePathMetadataCacheItem {
		const frontmatter = publish.site.cache.cache[storagePath]?.frontmatter;

		MB_DEBUG &&
			console.log('meta-bind | Obs Source >> loaded frontmatter', structuredClone(frontmatter), storagePath);

		return {
			data: structuredClone(frontmatter) ?? {},
			storagePath: storagePath,
			...this.manager.getDefaultCacheItem(),
		};
	}

	syncExternal(_: FilePathMetadataCacheItem): void {
		// no-op
	}
}

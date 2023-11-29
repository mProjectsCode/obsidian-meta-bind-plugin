import { type IMetadataAdapter } from '../../src/metadata/IMetadataAdapter';
import { type IMetadataSubscription } from '../../src/metadata/IMetadataSubscription';
import { type Metadata, type MetadataManagerCacheItem } from '../../src/metadata/MetadataManagerCacheItem';
import { type MetadataManager } from '../../src/metadata/MetadataManager';

export class TestMetadataAdapter implements IMetadataAdapter {
	manager: MetadataManager | undefined;
	metadata: Map<string, Metadata>;
	updatedMetadata: Map<string, Metadata>;

	constructor(metadata: Map<string, Metadata>) {
		this.metadata = metadata;
		this.updatedMetadata = new Map<string, Metadata>();
	}

	public getMetadataAndExtraCache(subscription: IMetadataSubscription): { metadata: Metadata; extraCache: unknown } {
		return {
			extraCache: undefined,
			metadata: structuredClone(this.metadata.get(subscription.bindTarget?.storagePath ?? '') ?? {}),
		};
	}

	public load(): void {}

	public setManagerInstance(manager: MetadataManager): void {
		this.manager = manager;
	}

	public unload(): void {}

	public updateMetadata(filePath: string, fileCache: MetadataManagerCacheItem): void {
		this.updatedMetadata.set(filePath, structuredClone(fileCache.metadata));
	}
}

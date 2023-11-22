import { type IMetadataAdapter } from './IMetadataAdapter';
import { type MetadataManager } from './MetadataManager';
import { type Metadata, type MetadataManagerCacheItem } from './MetadataManagerCacheItem';
import { type IMetadataSubscription } from './IMetadataSubscription';
import structuredClone from '@ungap/structured-clone';

export class PublishMetadataAdapter implements IMetadataAdapter {
	manager: MetadataManager | undefined;
	metadata: Map<string, Metadata>;
	updatedMetadata: Map<string, Metadata>;

	constructor() {
		this.metadata = new Map<string, Record<string, unknown>>();
		this.updatedMetadata = new Map<string, Metadata>();
	}

	public getMetadataAndExtraCache(subscription: IMetadataSubscription): { metadata: Metadata; extraCache: unknown } {
		return {
			extraCache: undefined,
			metadata: structuredClone(this.metadata.get(subscription.bindTarget?.filePath ?? '') ?? {}),
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

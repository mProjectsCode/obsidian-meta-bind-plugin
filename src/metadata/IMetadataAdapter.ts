import { type Metadata, type MetadataManagerCacheItem } from './MetadataManagerCacheItem';
import { type MetadataManager } from './MetadataManager';
import { type IMetadataSubscription } from './IMetadataSubscription';

export interface IMetadataAdapter {
	getMetadataAndExtraCache(subscription: IMetadataSubscription): { metadata: Metadata; extraCache: unknown };

	updateMetadata(filePath: string, fileCache: MetadataManagerCacheItem): Promise<void> | void;

	setManagerInstance(manager: MetadataManager): void;

	load(): void;

	unload(): void;
}

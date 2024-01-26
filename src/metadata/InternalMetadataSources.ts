import { type IMetadataSource, MapMetadataSource, type Metadata } from './MetadataSource';
import { type GlobalMetadataCacheItem, type MapMetadataCacheItem } from './MetadataCacheItem';
import { type MetadataManager } from './MetadataManager';
import { type BindTargetDeclaration } from '../parsers/bindTargetParser/BindTargetDeclaration';
import { type PropPath } from '../utils/prop/PropPath';
import { type IMetadataSubscription } from './IMetadataSubscription';
import { PropUtils } from '../utils/prop/PropUtils';
import { ErrorLevel, MetaBindInternalError } from '../utils/errors/MetaBindErrors';

export class InternalMetadataSource extends MapMetadataSource<MapMetadataCacheItem> {
	public getDefaultCacheItem(storagePath: string): MapMetadataCacheItem {
		return {
			data: {},
			storagePath: storagePath,
			...this.manager.getDefaultCacheItem(),
		};
	}

	public async syncExternal(_cacheItem: MapMetadataCacheItem): Promise<void> {
		// Do nothing
	}
}

export class GlobalMetadataSource implements IMetadataSource<GlobalMetadataCacheItem> {
	public readonly id: string;
	public readonly manager: MetadataManager;
	public readonly cache: GlobalMetadataCacheItem;

	constructor(id: string, manager: MetadataManager) {
		this.id = id;
		this.manager = manager;

		this.cache = {
			data: {},
			...this.manager.getDefaultCacheItem(),
		};
	}

	public delete(_cacheItem: GlobalMetadataCacheItem): void {
		// noop
	}

	public getCacheItemForStoragePath(_storagePath: string): GlobalMetadataCacheItem | undefined {
		return this.cache;
	}

	public iterateCacheItems(): IterableIterator<GlobalMetadataCacheItem> {
		return [this.cache][Symbol.iterator]();
	}

	public onCycle(_cacheItem: GlobalMetadataCacheItem): void {
		// noop
	}

	public readCache(_bindTarget: BindTargetDeclaration): unknown {
		return this.readCacheItem(this.cache, _bindTarget.storageProp);
	}

	public readCacheItem(cacheItem: GlobalMetadataCacheItem, propPath: PropPath): unknown {
		return PropUtils.tryGet(cacheItem.data, propPath);
	}

	public shouldDelete(_cacheItem: GlobalMetadataCacheItem): boolean {
		return false;
	}

	public subscribe(subscription: IMetadataSubscription): GlobalMetadataCacheItem {
		this.cache.subscriptions.push(subscription);
		return this.cache;
	}

	public syncExternal(_cacheItem: GlobalMetadataCacheItem): void {
		// noop
	}

	public unsubscribe(subscription: IMetadataSubscription): GlobalMetadataCacheItem {
		this.cache.subscriptions = this.cache.subscriptions.filter(x => x.uuid !== subscription.uuid);

		return this.cache;
	}

	public update(value: unknown, subscription: IMetadataSubscription): GlobalMetadataCacheItem {
		if (subscription.bindTarget === undefined) {
			throw new MetaBindInternalError({
				errorLevel: ErrorLevel.CRITICAL,
				effect: 'can not update metadata',
				cause: 'subscription bind target undefined',
			});
		}

		PropUtils.setAndCreate(this.cache.data, subscription.bindTarget.storageProp, value);

		return this.cache;
	}

	public updateEntireCache(value: Metadata, cacheItem: GlobalMetadataCacheItem): void {
		cacheItem.data = value;
	}

	public readEntireCacheItem(cacheItem: GlobalMetadataCacheItem): Metadata {
		return cacheItem.data;
	}
}

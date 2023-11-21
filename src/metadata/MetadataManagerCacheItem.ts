import { type IMetadataSubscription } from './IMetadataSubscription';

export type Metadata = Record<string, unknown>;

export interface MetadataManagerCacheItem {
	extraCache: unknown;
	metadata: Metadata;
	subscriptions: IMetadataSubscription[];
	/**
	 * The cycles since the last change to the cache by the plugin.
	 */
	cyclesSinceLastChange: number;
	/**
	 * Whether the cache was changed by th plugin. If this is true, the frotmatter should be updated.
	 */
	changed: boolean;
	/**
	 * The cycles that the cache has been inactive, meaning no listener registered to it.
	 */
	cyclesSinceInactive: number;
	/**
	 * Whether the there are no subscribers to the cache.
	 */
	inactive: boolean;
}

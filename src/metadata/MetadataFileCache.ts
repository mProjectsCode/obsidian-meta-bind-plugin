import { Listener } from '../utils/Signal';
import { FrontMatterCache, TFile } from 'obsidian';

export interface MetadataFileCacheListener extends Listener<any | undefined> {
	metadataPath: string[];
	listenToChildren: boolean;
}

export interface MetadataFileCache {
	file: TFile;
	metadata: FrontMatterCache;
	listeners: MetadataFileCacheListener[];
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

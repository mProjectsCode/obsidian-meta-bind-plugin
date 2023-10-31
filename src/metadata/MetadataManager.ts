import { areArraysEqual, arrayStartsWith, traverseObjectToParentByPath } from '../utils/Utils';
import { traverseObjectByPath } from '@opd-libs/opd-utils-lib/lib/ObjectTraversalUtils';
import { type Signal } from '../utils/Signal';
import { type Metadata, type MetadataManagerCacheItem } from './MetadataManagerCacheItem';
import { type FullBindTarget } from '../parsers/inputFieldParser/InputFieldDeclaration';
import { ErrorLevel, MetaBindBindTargetError, MetaBindInternalError } from '../utils/errors/MetaBindErrors';
import { type IMetadataAdapter } from './IMetadataAdapter';
import { type IMetadataSubscription } from './IMetadataSubscription';
import { MetadataSubscription } from './MetadataSubscription';
import { ComputedMetadataSubscription, type ComputedSubscriptionDependency, type ComputeFunction } from './ComputedMetadataSubscription';

export const metadataCacheUpdateCycleThreshold = 5; // {syncInterval (200)} * 5 = 1s
export const metadataCacheInactiveCycleThreshold = 5 * 60; // {syncInterval (200)} * 5 * 60 = 1 minute

/**
 * Checks if bind target `b` should receive an update when bind target `a` changes.
 *
 * @param a
 * @param b
 */
function hasUpdateOverlap(a: FullBindTarget | undefined, b: FullBindTarget | undefined): boolean {
	if (a === undefined || b === undefined) {
		return false;
	}

	if (a.filePath !== b.filePath) {
		return false;
	}

	return metadataPathHasUpdateOverlap(a.metadataPath, b.metadataPath, b.listenToChildren);
}

/**
 * Checks if path `b` should receive an update when path `a` changes.
 * The rules are as follows:
 *  - if they are equal
 *  - if `b` starts with `a` (`a = foo.bar` and `b = foo.bar.baz`)
 *  - if `b` has `listenToChildren` and `a` starts with `b`  (`a = foo.bar.baz` and `b = foo.bar`)
 *
 * @param a
 * @param b
 * @param listenToChildren whether b listens to updates in children
 */
function metadataPathHasUpdateOverlap(a: string[], b: string[], listenToChildren: boolean): boolean {
	if (areArraysEqual(a, b)) {
		return true;
	}

	if (arrayStartsWith(b, a)) {
		return true;
	}

	return listenToChildren && arrayStartsWith(a, b);
}

function bindTargetToString(a: FullBindTarget | undefined): string {
	if (a === undefined) {
		return 'undefined';
	}

	return `${a.filePath}#${a.metadataPath}`;
}

export class MetadataManager {
	cache: Map<string, MetadataManagerCacheItem>;
	// interval: number | undefined;
	metadataAdapter: IMetadataAdapter;

	constructor(metadataAdapter: IMetadataAdapter) {
		this.cache = new Map<string, MetadataManagerCacheItem>();

		this.metadataAdapter = metadataAdapter;
		this.metadataAdapter.setManagerInstance(this);
		this.metadataAdapter.load();
	}

	unload(): void {
		this.metadataAdapter.unload();
	}

	/**
	 * Subscribes a not yet subscribed subscription instance.
	 *
	 * @param subscription
	 * @private
	 */
	private subscribeSubscription(subscription: IMetadataSubscription): void {
		if (subscription.bindTarget === undefined) {
			return;
		}

		const fileCache: MetadataManagerCacheItem | undefined = this.getCacheForFile(subscription.bindTarget.filePath);

		if (fileCache) {
			console.debug(
				`meta-bind | MetadataManager >> registered ${subscription.uuid} to existing file cache ${subscription.bindTarget.filePath} -> ${subscription.bindTarget.metadataPath}`,
			);

			fileCache.inactive = false;
			fileCache.cyclesSinceInactive = 0;
			fileCache.listeners.push(subscription);

			subscription.notify(traverseObjectByPath(subscription.bindTarget.metadataPath, fileCache.metadata));
		} else {
			console.debug(
				`meta-bind | MetadataManager >> registered ${subscription.uuid} to newly created file cache ${subscription.bindTarget.filePath} -> ${subscription.bindTarget.metadataPath}`,
			);

			// const file = this.plugin.app.vault.getAbstractFileByPath(subscription.bindTarget.filePath) as TFile;
			// const frontmatter = this.plugin.app.metadataCache.getFileCache(file)?.frontmatter;
			const { metadata, extraCache } = this.metadataAdapter.getMetadataAndExtraCache(subscription);

			const newCache: MetadataManagerCacheItem = Object.assign(
				{},
				{
					extraCache: extraCache,
					metadata: metadata,
					listeners: [subscription],
					cyclesSinceLastChange: 0,
					cyclesSinceInactive: 0,
					inactive: false,
					changed: false,
				},
			);
			console.log(`meta-bind | MetadataManager >> loaded metadata for file ${subscription.bindTarget.filePath}`, newCache.metadata);

			subscription.notify(traverseObjectByPath(subscription.bindTarget.metadataPath, newCache.metadata));

			this.createCacheForFile(subscription.bindTarget.filePath, newCache);
		}
	}

	/**
	 * Subscribes to the metadata manager.
	 *
	 * @param uuid
	 * @param callbackSignal
	 * @param bindTarget
	 */
	public subscribe(uuid: string, callbackSignal: Signal<unknown>, bindTarget: FullBindTarget): MetadataSubscription {
		const subscription: MetadataSubscription = new MetadataSubscription(uuid, callbackSignal, this, bindTarget);

		this.subscribeSubscription(subscription);

		return subscription;
	}

	/**
	 * Subscribes a computed subscription to the metadata manager.
	 *
	 * @param uuid
	 * @param callbackSignal
	 * @param bindTarget
	 * @param dependencies
	 * @param computeFunction
	 */
	public subscribeComputed(
		uuid: string,
		callbackSignal: Signal<unknown>,
		bindTarget: FullBindTarget | undefined,
		dependencies: ComputedSubscriptionDependency[],
		computeFunction: ComputeFunction,
	): ComputedMetadataSubscription {
		const subscription: ComputedMetadataSubscription = new ComputedMetadataSubscription(
			uuid,
			callbackSignal,
			this,
			bindTarget,
			dependencies,
			computeFunction,
		);

		this.checkForLoops(subscription);

		subscription.init();

		this.subscribeSubscription(subscription);

		return subscription;
	}

	private checkForLoops(subscription: IMetadataSubscription): void {
		for (const dependency of this.getAllSubscriptionsToDependencies(subscription)) {
			this.recCheckForLoops([subscription, dependency]);
		}
	}

	/**
	 * Recursively checks for loops in subscription dependencies
	 *
	 * @param dependencyPath
	 * @private
	 */
	private recCheckForLoops(dependencyPath: IMetadataSubscription[]): void {
		// console.warn('checking for loops', dependencyPath.map(x => `"${bindTargetsToString(x.bindTarget)}"`).join(' -> '));

		const firstDependency = dependencyPath.first();
		const lastDependency = dependencyPath.last();
		if (lastDependency === undefined || firstDependency === undefined) {
			return;
		}

		if (hasUpdateOverlap(firstDependency.bindTarget, lastDependency.bindTarget)) {
			throw new MetaBindBindTargetError(
				ErrorLevel.ERROR,
				'bind target dependency loop detected',
				`the loop is as follows: ${dependencyPath.map(x => `"${bindTargetToString(x.bindTarget)}"`).join(' -> ')}`,
			);
		}

		// console.warn('next step dependencies', this.getAllSubscriptionsToDependencies(lastDependency));
		// i need to get all listeners that point to the same bind target for each dependency
		for (const dependency of this.getAllSubscriptionsToDependencies(lastDependency)) {
			this.recCheckForLoops([...dependencyPath, dependency]);
		}
	}

	/**
	 * Gets all subscriptions that listen to any of a subscriptions dependencies.
	 *
	 * @param subscription
	 * @private
	 */
	private getAllSubscriptionsToDependencies(subscription: IMetadataSubscription): IMetadataSubscription[] {
		return subscription
			.getDependencies()
			.map(x => this.getAllSubscriptionsToBindTarget(x.bindTarget))
			.flat();
	}

	/**
	 * Gets all subscriptions that listen to a specific bind target.
	 *
	 * @param bindTarget
	 * @private
	 */
	private getAllSubscriptionsToBindTarget(bindTarget: FullBindTarget | undefined): IMetadataSubscription[] {
		if (bindTarget === undefined) {
			return [];
		}

		const fileCache = this.getCacheForFile(bindTarget.filePath);
		if (!fileCache) {
			return [];
		}

		const ret = [];
		for (const subscription of fileCache.listeners) {
			if (hasUpdateOverlap(subscription.bindTarget, bindTarget)) {
				ret.push(subscription);
			}
		}

		return fileCache.listeners.filter(x => hasUpdateOverlap(x.bindTarget, bindTarget));
	}

	/**
	 * Unsubscribe a subscription.
	 *
	 * @param subscription
	 */
	unsubscribe(subscription: IMetadataSubscription): void {
		if (subscription.bindTarget === undefined) {
			return;
		}

		const filePath = subscription.bindTarget.filePath;

		const fileCache = this.getCacheForFile(filePath);
		if (!fileCache) {
			return;
		}

		console.debug(`meta-bind | MetadataManager >> unregistered ${subscription.uuid} to from file cache ${filePath}`);

		fileCache.listeners = fileCache.listeners.filter(x => x.uuid !== subscription.uuid);
		if (fileCache.listeners.length === 0) {
			console.debug(`meta-bind | MetadataManager >> marked unused file cache as inactive ${filePath}`);
			fileCache.inactive = true;
		}
	}

	getCacheForFile(filePath: string): MetadataManagerCacheItem | undefined {
		return this.cache.get(filePath);
	}

	/**
	 * Creates a cache for a file path, throws if the cache already exists.
	 *
	 * @param filePath
	 * @param cache
	 */
	createCacheForFile(filePath: string, cache: MetadataManagerCacheItem): void {
		if (this.cache.has(filePath)) {
			throw new MetaBindInternalError(ErrorLevel.CRITICAL, 'can not create metadata file cache', 'cache for file already exists');
		}
		this.cache.set(filePath, cache);
	}

	/**
	 * Internal update function that runs each cycle.
	 *
	 * @private
	 */
	public update(): void {
		// console.debug('meta-bind | updating metadata manager');
		const markedForDelete: string[] = [];

		for (const [filePath, cacheEntry] of this.cache) {
			// if the entry changed, update the frontmatter of the note
			if (cacheEntry.changed) {
				void this.updateExternal(filePath, cacheEntry);
			}
			cacheEntry.cyclesSinceLastChange += 1;

			// if the cache is inactive, count cycles, then delete the cache
			if (cacheEntry.inactive) {
				cacheEntry.cyclesSinceInactive += 1;
			}
			if (cacheEntry.cyclesSinceInactive > metadataCacheInactiveCycleThreshold) {
				markedForDelete.push(filePath);
			}
		}

		for (const filePath of markedForDelete) {
			this.cache.delete(filePath);
		}
	}

	/**
	 * Updates the external cached source.
	 *
	 * @param fileCache
	 */
	async updateExternal(filePath: string, fileCache: MetadataManagerCacheItem): Promise<void> {
		// console.debug(`meta-bind | MetadataManager >> updating frontmatter of "${fileCache.file.path}" to`, fileCache.metadata);
		try {
			await this.metadataAdapter.updateMetadata(filePath, fileCache);
		} catch (e) {
			fileCache.changed = false;
			console.warn('failed to update frontmatter', e);
		}
	}

	/**
	 * For when a subscription want's to update the cache.
	 *
	 * @param value
	 * @param subscription
	 */
	updateCache(value: unknown, subscription: IMetadataSubscription): void {
		if (subscription.bindTarget === undefined) {
			return;
		}

		const metadataPath = subscription.bindTarget.metadataPath;
		const filePath = subscription.bindTarget.filePath;

		console.debug(`meta-bind | MetadataManager >> updating "${JSON.stringify(metadataPath)}" in "${filePath}" metadata cache to`, value);

		const fileCache = this.getCacheForFile(filePath);
		if (!fileCache) {
			return;
		}

		const { parent, child } = traverseObjectToParentByPath(metadataPath, fileCache.metadata);

		if (parent.value == null) {
			throw Error(`The parent of "${JSON.stringify(metadataPath)}" does not exist in Object, please create the parent first`);
		}

		// @ts-ignore
		parent.value[child.key] = value;
		fileCache.cyclesSinceLastChange = 0;
		fileCache.changed = true;

		this.notifyListeners(fileCache, metadataPath, subscription.uuid);
	}

	/**
	 * For when the external cached source updates.
	 *
	 * @param filePath
	 * @param newMetadata
	 */
	updateCacheOnExternalUpdate(filePath: string, newMetadata: Metadata): void {
		const fileCache = this.getCacheForFile(filePath);
		if (!fileCache) {
			return;
		}

		// don't update if the user recently changed the cache
		if (fileCache.cyclesSinceLastChange < metadataCacheUpdateCycleThreshold) {
			return;
		}

		const metadata: Record<string, unknown> = Object.assign({}, newMetadata); // copy
		delete metadata.position;

		console.debug(`meta-bind | MetadataManager >> updating "${filePath}" on frontmatter update`, metadata);

		fileCache.metadata = metadata;

		this.notifyListeners(fileCache);
	}

	/**
	 * Notifies all subscriptions except a certain except id to prevent infinite loops.
	 *
	 * @param fileCache
	 * @param metadataPath
	 * @param exceptUuid
	 */
	notifyListeners(fileCache: MetadataManagerCacheItem, metadataPath?: string[] | undefined, exceptUuid?: string | undefined): void {
		// console.log(fileCache);

		for (const listener of fileCache.listeners) {
			if (exceptUuid && exceptUuid === listener.uuid) {
				continue;
			}

			if (listener.bindTarget === undefined) {
				continue;
			}

			if (metadataPath) {
				if (metadataPathHasUpdateOverlap(metadataPath, listener.bindTarget.metadataPath, listener.bindTarget.listenToChildren)) {
					const value: unknown = traverseObjectByPath(listener.bindTarget.metadataPath, fileCache.metadata);
					console.debug(`meta-bind | MetadataManager >> notifying input field ${listener.uuid} of updated metadata value`, value);
					listener.notify(value);
				}
			} else {
				const value: unknown = traverseObjectByPath(listener.bindTarget.metadataPath, fileCache.metadata);
				console.debug(
					`meta-bind | MetadataManager >> notifying input field ${listener.uuid} of updated metadata`,
					listener.bindTarget.metadataPath,
					fileCache.metadata,
					value,
				);
				listener.notify(value);
			}
		}
	}
}

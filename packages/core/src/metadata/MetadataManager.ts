import type {
	ComputedSubscriptionDependency,
	ComputeFunction,
} from 'packages/core/src/metadata/ComputedMetadataSubscription';
import { ComputedMetadataSubscription } from 'packages/core/src/metadata/ComputedMetadataSubscription';
import type { IMetadataSubscription } from 'packages/core/src/metadata/IMetadataSubscription';
import type { IMetadataCacheItem } from 'packages/core/src/metadata/MetadataCacheItem';
import type { IMetadataSource, Metadata } from 'packages/core/src/metadata/MetadataSource';
import { MetadataSubscription } from 'packages/core/src/metadata/MetadataSubscription';
import type { BindTargetDeclaration } from 'packages/core/src/parsers/bindTargetParser/BindTargetDeclaration';
import {
	ErrorLevel,
	MetaBindBindTargetError,
	MetaBindInternalError,
} from 'packages/core/src/utils/errors/MetaBindErrors';
import type { PropPath } from 'packages/core/src/utils/prop/PropPath';
import { PropUtils } from 'packages/core/src/utils/prop/PropUtils';
import type { Signal } from 'packages/core/src/utils/Signal';

export const METADATA_CACHE_UPDATE_CYCLE_THRESHOLD = 5; // {syncInterval (200)} * 5 = 1s
export const METADATA_CACHE_INACTIVE_CYCLE_THRESHOLD = 5 * 60; // {syncInterval (200)} * 5 * 60 = 1 minute

export type MetadataSource = IMetadataSource<IMetadataCacheItem>;

/**
 * Checks if bind target `b` should receive an update when bind target `a` changes.
 *
 * @param a
 * @param b
 */
export function hasUpdateOverlap(a: BindTargetDeclaration | undefined, b: BindTargetDeclaration | undefined): boolean {
	if (a === undefined || b === undefined) {
		return false;
	}

	if (a.storageType !== b.storageType) {
		return false;
	}

	if (a.storagePath !== b.storagePath) {
		return false;
	}

	// TODO: this can be faster, no need to create new arrays
	return metadataPathHasUpdateOverlap(a.storageProp, b.storageProp, b.listenToChildren);
}

/**
 * Checks if path `b` should receive an update when path `a` changes.
 * The rules are as follows:
 *
 *  - b = foo.bar.baz
 *      - a = foo.bar -> true
 *      - a = foo.bar.baz -> true
 *      - a = foo.bar.baz.baz -> true
 *      - a = foo.bar.foo -> false
 *      - a = foo.foo -> false
 *
 * @param a
 * @param b
 * @param listenToChildren whether b listens to updates in children
 */
export function metadataPathHasUpdateOverlap(a: PropPath, b: PropPath, listenToChildren: boolean): boolean {
	const aPath = a.path;
	const bPath = b.path;

	for (let i = 0; i < Math.min(aPath.length, bPath.length); i++) {
		if (aPath[i].type !== bPath[i].type || aPath[i].prop !== bPath[i].prop) {
			return false;
		}
	}

	if (aPath.length > bPath.length) {
		return listenToChildren;
	} else {
		return true;
	}
}

export function bindTargetToString(a: BindTargetDeclaration | undefined): string {
	if (a === undefined) {
		return 'undefined';
	}

	return `${a.storagePath}#${a.storageProp.toString()}`;
}

export class MetadataManager {
	sources: Map<string, MetadataSource>;
	defaultSource: string;

	constructor() {
		this.sources = new Map<string, MetadataSource>();
		this.defaultSource = 'CHANGE_THE_DEFAULT_SOURCE';
	}

	public registerSource(source: MetadataSource): void {
		this.sources.set(source.id, source);
	}

	public setDefaultSource(id: string): void {
		if (this.sources.has(id)) {
			this.defaultSource = id;
		} else {
			throw new MetaBindInternalError({
				errorLevel: ErrorLevel.CRITICAL,
				effect: 'can not set default source',
				cause: `Source "${id}" does not exist`,
			});
		}
	}

	public unregisterSource(source: MetadataSource): void {
		this.sources.delete(source.id);
	}

	public getSource(id: string): MetadataSource | undefined {
		return this.sources.get(id);
	}

	public iterateSources(): IterableIterator<string> {
		return this.sources.keys();
	}

	public subscribe(
		uuid: string,
		callbackSignal: Signal<unknown>,
		bindTarget: BindTargetDeclaration,
		onDelete: () => void,
	): MetadataSubscription {
		const subscription: MetadataSubscription = new MetadataSubscription(
			uuid,
			callbackSignal,
			this,
			bindTarget,
			onDelete,
		);

		this.subscribeSubscription(subscription);

		return subscription;
	}

	/**
	 * Subscribes a computed value to the metadata manager.
	 *
	 * @param uuid
	 * @param callbackSignal The signal that will hold the computed value.
	 * @param bindTarget The bind target that the computed value will be written to.
	 * @param dependencies The dependencies of the computed value.
	 * @param computeFunction The function that computes the value from the dependencies.
	 * @param onDelete Called when the metadata manager wants to delete the subscription.
	 */
	public subscribeComputed(
		uuid: string,
		callbackSignal: Signal<unknown>,
		bindTarget: BindTargetDeclaration | undefined,
		dependencies: ComputedSubscriptionDependency[],
		computeFunction: ComputeFunction,
		onDelete: () => void,
	): ComputedMetadataSubscription {
		const subscription: ComputedMetadataSubscription = new ComputedMetadataSubscription(
			uuid,
			callbackSignal,
			this,
			bindTarget,
			dependencies,
			computeFunction,
			onDelete,
		);

		this.checkForLoops(subscription);

		subscription.init();

		this.subscribeSubscription(subscription);

		return subscription;
	}

	public unsubscribe(subscription: IMetadataSubscription): void {
		if (subscription.bindTarget === undefined) {
			return;
		}

		const source = this.getSource(subscription.bindTarget.storageType);
		if (source === undefined) {
			throw new MetaBindInternalError({
				errorLevel: ErrorLevel.ERROR,
				effect: 'can not unsubscribe subscription',
				cause: `Source "${subscription.bindTarget.storageType}" does not exist`,
			});
		}

		const cacheItem = source.unsubscribe(subscription);
		if (cacheItem.subscriptions.length === 0) {
			cacheItem.inactive = true;
		}
	}

	private subscribeSubscription(subscription: IMetadataSubscription): void {
		if (subscription.bindTarget === undefined) {
			return;
		}

		const source = this.getSource(subscription.bindTarget.storageType);
		if (source === undefined) {
			throw new MetaBindInternalError({
				errorLevel: ErrorLevel.ERROR,
				effect: 'can not subscribe subscription',
				cause: `Source "${subscription.bindTarget.storageType}" does not exist`,
			});
		}

		const cacheItem = source.subscribe(subscription);
		cacheItem.inactive = false;
		cacheItem.cyclesSinceInactive = 0;

		subscription.notify(source.readCacheItem(cacheItem, subscription.bindTarget.storageProp));
	}

	/**
	 * Checks if a subscription would create a loop in the subscription dependency graph.
	 *
	 * @param subscription
	 * @private
	 */
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

		const firstDependency = dependencyPath.at(0);
		const lastDependency = dependencyPath.at(-1);
		if (lastDependency === undefined || firstDependency === undefined) {
			return;
		}

		if (hasUpdateOverlap(firstDependency.bindTarget, lastDependency.bindTarget)) {
			throw new MetaBindBindTargetError({
				errorLevel: ErrorLevel.ERROR,
				effect: 'bind target dependency loop detected',
				cause: `the loop is as follows: ${dependencyPath
					.map(x => `"${bindTargetToString(x.bindTarget)}"`)
					.join(' -> ')}`,
				docs: [
					'https://mprojectscode.github.io/obsidian-meta-bind-plugin-docs/guides/viewfields/#circular-dependencies',
				],
			});
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
	private getAllSubscriptionsToBindTarget(bindTarget: BindTargetDeclaration | undefined): IMetadataSubscription[] {
		if (bindTarget === undefined) {
			return [];
		}

		const fileCache = this.getCacheItemForBindTarget(bindTarget);
		if (!fileCache) {
			return [];
		}

		const ret = [];
		for (const subscription of fileCache.subscriptions) {
			if (hasUpdateOverlap(subscription.bindTarget, bindTarget)) {
				ret.push(subscription);
			}
		}

		return fileCache.subscriptions.filter(x => hasUpdateOverlap(x.bindTarget, bindTarget));
	}

	/**
	 * Gets the cache item that the bind target points to.
	 * Returns undefined if the cache item does not exist.
	 *
	 * @param bindTarget
	 * @private
	 */
	private getCacheItemForBindTarget(bindTarget: BindTargetDeclaration): IMetadataCacheItem | undefined {
		return this.getSource(bindTarget.storageType)?.getCacheItemForStoragePath(bindTarget.storagePath);
	}

	/**
	 * Internal update function that runs each cycle.
	 */
	public cycle(): void {
		for (const source of this.sources.values()) {
			const markedForDelete: IMetadataCacheItem[] = [];

			for (const cacheItem of source.iterateCacheItems()) {
				source.onCycle(cacheItem);

				if (cacheItem.pendingInternalChange) {
					try {
						source.syncExternal(cacheItem);
					} catch (e) {
						console.warn('failed to update frontmatter', e);
					}
					cacheItem.pendingInternalChange = false;
				}
				cacheItem.cyclesSinceInternalChange += 1;

				if (cacheItem.inactive) {
					cacheItem.cyclesSinceInactive += 1;
				}
				if (
					cacheItem.cyclesSinceInactive > METADATA_CACHE_INACTIVE_CYCLE_THRESHOLD &&
					source.shouldDelete(cacheItem)
				) {
					markedForDelete.push(cacheItem);
				}
			}

			for (const cacheItem of markedForDelete) {
				source.deleteCache(cacheItem);
			}
		}
	}

	/**
	 * Writes to the cache.
	 * This is an internal update.
	 *
	 * @param value
	 * @param bindTarget
	 * @param updateSourceUuid the uuid of the subscription that initiated the update, if the update was initiated by a subscription
	 */
	public write(value: unknown, bindTarget: BindTargetDeclaration, updateSourceUuid?: string): void {
		const source = this.getSource(bindTarget.storageType);
		if (source === undefined) {
			throw new MetaBindInternalError({
				errorLevel: ErrorLevel.ERROR,
				effect: 'can not write to cache',
				cause: `Source "${bindTarget.storageType}" does not exist`,
			});
		}

		const cacheItem = source.writeCache(value, bindTarget);
		cacheItem.pendingInternalChange = true;
		cacheItem.cyclesSinceInternalChange = 0;
		this.notifyListeners(bindTarget, updateSourceUuid);
	}

	/**
	 * Reads from the cache.
	 *
	 * @param bindTarget
	 */
	public read(bindTarget: BindTargetDeclaration): unknown {
		const source = this.getSource(bindTarget.storageType);
		if (source === undefined) {
			throw new MetaBindInternalError({
				errorLevel: ErrorLevel.ERROR,
				effect: 'can not read metadata',
				cause: `Source "${bindTarget.storageType}" does not exist`,
			});
		}

		return source.readCache(bindTarget);
	}

	/**
	 * Checks if a cache item is locked for external writes.
	 * If true external updates should not be applied.
	 *
	 * @param cacheItem
	 */
	public isCacheExternalWriteLocked(cacheItem: IMetadataCacheItem): boolean {
		return cacheItem.cyclesSinceInternalChange < METADATA_CACHE_UPDATE_CYCLE_THRESHOLD;
	}

	/**
	 * Notifies all listeners that overlap with the bind target provided.
	 * Except the one where the uuid is equal to the ignoreUuid.
	 *
	 * @param bindTarget
	 * @param ignoreUuid
	 * @private
	 */
	private notifyListeners(bindTarget: BindTargetDeclaration, ignoreUuid?: string): void {
		const source = this.getSource(bindTarget.storageType);
		if (source === undefined) {
			throw new MetaBindInternalError({
				errorLevel: ErrorLevel.ERROR,
				effect: 'can notify listeners metadata',
				cause: `Source "${bindTarget.storageType}" does not exist`,
			});
		}

		const cacheItem = source.getCacheItemForStoragePath(bindTarget.storagePath);
		if (cacheItem === undefined) {
			return;
		}

		for (const cacheSubscription of cacheItem.subscriptions) {
			if (
				(ignoreUuid !== undefined && ignoreUuid === cacheSubscription.uuid) ||
				cacheSubscription.bindTarget === undefined
			) {
				continue;
			}

			if (
				metadataPathHasUpdateOverlap(
					bindTarget.storageProp,
					cacheSubscription.bindTarget.storageProp,
					cacheSubscription.bindTarget.listenToChildren,
				)
			) {
				const value = source.readCache(cacheSubscription.bindTarget);
				cacheSubscription.notify(value);
			}
		}
	}

	/**
	 * Notifies all listeners of a cache item.
	 *
	 * @param source
	 * @param cacheItem
	 */
	public notifyAllListeners(source: MetadataSource, cacheItem: IMetadataCacheItem): void {
		for (const subscription of cacheItem.subscriptions) {
			if (subscription.bindTarget === undefined) {
				continue;
			}

			const value = source.readCache(subscription.bindTarget);
			subscription.notify(value);
		}
	}

	/**
	 * Instantly deletes all caches in all sources for a given storage path.
	 *
	 * @param storagePath
	 */
	public deleteCachesForStoragePath(storagePath: string): void {
		for (const source of this.sources.values()) {
			const cacheItem = source.getCacheItemForStoragePath(storagePath);
			if (cacheItem === undefined) {
				continue;
			}
			cacheItem.subscriptions.forEach(x => x.delete());
			source.deleteCache(cacheItem);
		}
	}

	public getDefaultCacheItem(): IMetadataCacheItem {
		return {
			subscriptions: [],
			cyclesSinceInternalChange: METADATA_CACHE_UPDATE_CYCLE_THRESHOLD + 1,
			pendingInternalChange: false,
			cyclesSinceInactive: 0,
			inactive: true,
		};
	}

	/**
	 * A metadata source should call this when it's cache is updated externally.
	 * This will update all subscriptions that listen to the changed cache item.
	 *
	 * @param source
	 * @param storagePath
	 * @param value
	 */
	public onExternalUpdate(source: MetadataSource, storagePath: string, value: Metadata): void {
		MB_DEBUG && console.log('meta-bind | MetadataManager >> external update', source.id, storagePath, value);

		const cacheItem = source.getCacheItemForStoragePath(storagePath);
		if (cacheItem === undefined || this.isCacheExternalWriteLocked(cacheItem)) {
			return;
		}

		const oldValue = source.readEntireCacheItem(cacheItem);

		source.writeEntireCache(value, cacheItem);

		for (const subscription of cacheItem.subscriptions) {
			if (subscription.bindTarget === undefined) {
				continue;
			}

			const propPath = subscription.bindTarget.storageProp;

			const newBoundValue = PropUtils.tryGet(value, propPath);
			const oldBoundValue = PropUtils.tryGet(oldValue, propPath);

			if (newBoundValue !== oldBoundValue) {
				subscription.notify(newBoundValue);
			}
		}
	}

	/**
	 * This should be called when a storage path is deleted. E.g. when a note is deleted.
	 *
	 * @param storagePath
	 */
	public onStoragePathDeleted(storagePath: string): void {
		this.deleteCachesForStoragePath(storagePath);
	}

	/**
	 * This should be called when a storage path is renamed. E.g. when a note is renamed.
	 *
	 * @param oldStoragePath
	 * @param _newStoragePath
	 */
	public onStoragePathRenamed(oldStoragePath: string, _newStoragePath: string): void {
		this.deleteCachesForStoragePath(oldStoragePath);
	}
}

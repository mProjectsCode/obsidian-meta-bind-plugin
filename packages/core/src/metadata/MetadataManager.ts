import type { DeriveFunction } from 'packages/core/src/metadata/DerivedMetadataSubscription';
import { DerivedMetadataSubscription } from 'packages/core/src/metadata/DerivedMetadataSubscription';
import type { EffectFunction } from 'packages/core/src/metadata/EffectMetadataSubscription';
import { EffectMetadataSubscription } from 'packages/core/src/metadata/EffectMetadataSubscription';
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
import type { Signal, Writable } from 'packages/core/src/utils/Signal';

export const METADATA_CACHE_EXTERNAL_WRITE_LOCK_DURATION = 5; // {syncInterval (200)} * 5 = 1s
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
		callbackSignal: Writable<unknown>,
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
	 * Subscribes a derived value to the metadata manager.
	 *
	 * @param uuid
	 * @param bindTarget The bind target that the computed value will be written to.
	 * @param dependencies The dependencies of the computed value.
	 * @param dependencySignals The that will be used to listen to the dependencies.
	 * They should be used to retrieve the values of the dependencies in the derive function.
	 * @param deriveFunction The function that computes the value from the dependencies.
	 * @param onDelete Called when the metadata manager wants to delete the subscription.
	 */
	public subscribeDerived(
		uuid: string,
		bindTarget: BindTargetDeclaration | undefined,
		dependencies: BindTargetDeclaration[],
		dependencySignals: Signal<unknown>[],
		deriveFunction: DeriveFunction,
		onDelete: () => void,
	): DerivedMetadataSubscription {
		const subscription = new DerivedMetadataSubscription(
			uuid,
			this,
			bindTarget,
			dependencies,
			dependencySignals,
			deriveFunction,
			onDelete,
		);

		this.checkForLoops(subscription);

		subscription.init();

		this.subscribeSubscription(subscription);

		return subscription;
	}

	/**
	 * Subscribes an effect to the metadata manager.
	 *
	 * THE EFFECT FUNCTION SHOULD NOT UPDATE ANY BIND TARGETS. USE `subscribeDerived` FOR THAT.
	 *
	 * @param uuid
	 * @param dependencies The dependencies of the effect.
	 * @param dependencySignals The that will be used to listen to the dependencies.
	 * They should be used to retrieve the values of the dependencies in the derive function.
	 * @param effectFunction The function that computes the value from the dependencies.
	 * @param onDelete Called when the metadata manager wants to delete the subscription.
	 */
	public subscribeEffect(
		uuid: string,
		dependencies: BindTargetDeclaration[],
		dependencySignals: Signal<unknown>[],
		effectFunction: EffectFunction,
		onDelete: () => void,
	): EffectMetadataSubscription {
		const subscription = new EffectMetadataSubscription(
			uuid,
			this,
			dependencies,
			dependencySignals,
			effectFunction,
			onDelete,
		);

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
			cacheItem.cyclesWithoutListeners = 0;
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
		cacheItem.cyclesWithoutListeners = 0;

		const initialValue = source.readCacheItem(cacheItem, subscription.bindTarget.storageProp);
		subscription.onUpdate(initialValue);
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
			.map(x => this.getAllSubscriptionsToBindTarget(x))
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

				// if the cache is dirty, sync the changes to the external source
				if (cacheItem.dirty) {
					try {
						source.syncExternal(cacheItem);
					} catch (e) {
						console.warn(`failed to sync changes to external source for ${source.id}`, e);
					}
					cacheItem.dirty = false;
				}
				// decrease the external write lock duration
				if (cacheItem.externalWriteLock > 0) {
					cacheItem.externalWriteLock -= 1;
				}

				// if there are no listeners, increase the cycles without listeners
				if (cacheItem.subscriptions.length === 0) {
					cacheItem.cyclesWithoutListeners += 1;
				}
				// if the cache is inactive, check if it should be deleted
				if (
					cacheItem.cyclesWithoutListeners > METADATA_CACHE_INACTIVE_CYCLE_THRESHOLD &&
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

		const cacheItem = source.writeCache(structuredClone(value), bindTarget);
		cacheItem.dirty = true;
		cacheItem.externalWriteLock = METADATA_CACHE_EXTERNAL_WRITE_LOCK_DURATION;
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

		return structuredClone(source.readCache(bindTarget));
	}

	/**
	 * Reads from the cache without cloning the value.
	 *
	 * ONLY USE FOR SHORT LIVED VALUES, SO A VALUE THAT IS IMMEDIATELY USED AND DISCARDED.
	 *
	 * @param bindTarget
	 * @returns
	 */
	public readShortLived(bindTarget: BindTargetDeclaration): unknown {
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
		return cacheItem.externalWriteLock > 0;
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
				cacheSubscription.bindTarget === undefined ||
				!cacheSubscription.updatable()
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
				cacheSubscription.onUpdate(value);
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
			subscription.onUpdate(value);
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
			externalWriteLock: 0,
			dirty: false,
			cyclesWithoutListeners: 0,
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
		const cacheItem = source.getCacheItemForStoragePath(storagePath);
		if (cacheItem === undefined || this.isCacheExternalWriteLocked(cacheItem)) {
			return;
		}

		MB_DEBUG &&
			console.log(
				`meta-bind | MetadataManager >> external update in source "${source.id}" and storage path "${storagePath}"`,
				value,
			);

		source.writeEntireCache(value, cacheItem);

		let updatedCount = 0;

		for (const subscription of cacheItem.subscriptions) {
			if (subscription.bindTarget === undefined || !subscription.updatable()) {
				continue;
			}

			const newValue = PropUtils.tryGet(value, subscription.bindTarget.storageProp);
			const updated = subscription.onUpdate(newValue);

			if (updated) {
				updatedCount += 1;
			}
		}

		MB_DEBUG &&
			console.log(`meta-bind | MetadataManager >> external update >> updated ${updatedCount} subscriptions`);
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

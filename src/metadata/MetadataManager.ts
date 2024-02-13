import { type Signal } from '../utils/Signal';
import { ErrorLevel, MetaBindBindTargetError, MetaBindInternalError } from '../utils/errors/MetaBindErrors';
import { type IMetadataSubscription } from './IMetadataSubscription';
import { MetadataSubscription } from './MetadataSubscription';
import {
	ComputedMetadataSubscription,
	type ComputedSubscriptionDependency,
	type ComputeFunction,
} from './ComputedMetadataSubscription';
import { type BindTargetDeclaration } from '../parsers/bindTargetParser/BindTargetDeclaration';
import { type IMetadataSource, type Metadata } from './MetadataSource';
import { type IMetadataCacheItem } from './MetadataCacheItem';
import { areArraysEqual, arrayStartsWith } from '../utils/Utils';

export const METADATA_CACHE_UPDATE_CYCLE_THRESHOLD = 5; // {syncInterval (200)} * 5 = 1s
export const METADATA_CACHE_INACTIVE_CYCLE_THRESHOLD = 5 * 60; // {syncInterval (200)} * 5 * 60 = 1 minute
//
// /**
//  * Checks if bind target `b` should receive an update when bind target `a` changes.
//  *
//  * @param a
//  * @param b
//  */
// function hasUpdateOverlap(a: BindTargetDeclaration | undefined, b: BindTargetDeclaration | undefined): boolean {
// 	if (a === undefined || b === undefined) {
// 		return false;
// 	}
//
// 	if (a.storageType !== b.storageType) {
// 		return false;
// 	}
//
// 	if (a.storagePath !== b.storagePath) {
// 		return false;
// 	}
//
// 	return metadataPathHasUpdateOverlap(
// 		a.storageProp.toStringArray(),
// 		b.storageProp.toStringArray(),
// 		b.listenToChildren,
// 	);
// }
//
// /**
//  * Checks if path `b` should receive an update when path `a` changes.
//  * The rules are as follows:
//  *  - if they are equal
//  *  - if `b` starts with `a` (`a = foo.bar` and `b = foo.bar.baz`)
//  *  - if `b` has `listenToChildren` and `a` starts with `b`  (`a = foo.bar.baz` and `b = foo.bar`)
//  *
//  * @param a
//  * @param b
//  * @param listenToChildren whether b listens to updates in children
//  */
// function metadataPathHasUpdateOverlap(a: string[], b: string[], listenToChildren: boolean): boolean {
// 	if (areArraysEqual(a, b)) {
// 		return true;
// 	}
//
// 	if (arrayStartsWith(b, a)) {
// 		return true;
// 	}
//
// 	return listenToChildren && arrayStartsWith(a, b);
// }
//
// function bindTargetToString(a: BindTargetDeclaration | undefined): string {
// 	if (a === undefined) {
// 		return 'undefined';
// 	}
//
// 	return `${a.storagePath}#${a.storageProp.toString()}`;
// }
//
// export class MetadataManager {
// 	cache: Map<string, MetadataManagerCacheItem>;
// 	globalCache: MetadataManagerGlobalCache;
// 	metadataAdapter: IMetadataAdapter;
//
// 	constructor(metadataAdapter: IMetadataAdapter) {
// 		this.cache = new Map<string, MetadataManagerCacheItem>();
// 		this.globalCache = {
// 			metadata: deepFreeze({}),
// 			memory: {},
// 			subscriptions: [],
// 		};
//
// 		this.metadataAdapter = metadataAdapter;
// 		this.metadataAdapter.setManagerInstance(this);
// 		this.metadataAdapter.load();
// 	}
//
// 	unload(): void {
// 		this.metadataAdapter.unload();
// 	}
//
// 	/**
// 	 * Subscribes a not yet subscribed subscription instance.
// 	 *
// 	 * @param subscription
// 	 * @private
// 	 */
// 	private subscribeSubscription(subscription: IMetadataSubscription): void {
// 		if (subscription.bindTarget === undefined) {
// 			return;
// 		}
//
// 		if (subscription.bindTarget?.storageType === BindTargetStorageType.SCOPE) {
// 			// local scope should be resolved by the time the subscription is created
// 			throw new MetaBindInternalError({
// 				errorLevel: ErrorLevel.CRITICAL,
// 				effect: 'can not subscribe subscription',
// 				cause: 'local scope should be resolved by the time the subscription is created',
// 			});
// 		}
// 		if (subscription.bindTarget?.storageType === BindTargetStorageType.GLOBAL_MEMORY) {
// 			console.debug(
// 				`meta-bind | MetadataManager >> registered ${
// 					subscription.uuid
// 				} to global memory cache -> ${subscription.bindTarget.storageProp.toString()}`,
// 			);
// 			this.globalCache.subscriptions.push(subscription);
// 			subscription.notify(
// 				this.getPropertyFromCache(
// 					this.globalCache,
// 					subscription.bindTarget.storageType,
// 					subscription.bindTarget.storageProp,
// 				),
// 			);
// 			return;
// 		}
//
// 		const fileCache: MetadataManagerCacheItem | undefined = this.getCacheForFile(
// 			subscription.bindTarget.storagePath,
// 		);
//
// 		if (fileCache) {
// 			console.debug(
// 				`meta-bind | MetadataManager >> registered ${subscription.uuid} to existing file cache ${
// 					subscription.bindTarget.storagePath
// 				} -> ${subscription.bindTarget.storageProp.toString()}`,
// 			);
//
// 			fileCache.inactive = false;
// 			fileCache.cyclesSinceInactive = 0;
// 			fileCache.subscriptions.push(subscription);
//
// 			subscription.notify(
// 				this.getPropertyFromCache(
// 					fileCache,
// 					subscription.bindTarget.storageType,
// 					subscription.bindTarget.storageProp,
// 				),
// 			);
// 		} else {
// 			console.debug(
// 				`meta-bind | MetadataManager >> registered ${subscription.uuid} to newly created file cache ${
// 					subscription.bindTarget.storagePath
// 				} -> ${subscription.bindTarget.storageProp.toString()}`,
// 			);
//
// 			const { metadata, extraCache } = this.metadataAdapter.getMetadataAndExtraCache(subscription);
//
// 			const newCache: MetadataManagerCacheItem = {
// 				extraCache: extraCache,
// 				metadata: metadata,
// 				memory: {},
// 				subscriptions: [subscription],
// 				cyclesSinceLastChange: METADATA_CACHE_UPDATE_CYCLE_THRESHOLD + 1, // +1, so that is it bigger than the threshold
// 				cyclesSinceInactive: 0,
// 				inactive: false,
// 				changed: false,
// 			};
//
// 			console.log(
// 				`meta-bind | MetadataManager >> loaded metadata for file ${subscription.bindTarget.storagePath}`,
// 				newCache.metadata,
// 			);
//
// 			subscription.notify(
// 				this.getPropertyFromCache(
// 					newCache,
// 					subscription.bindTarget.storageType,
// 					subscription.bindTarget.storageProp,
// 				),
// 			);
//
// 			this.createCacheForFile(subscription.bindTarget.storagePath, newCache);
// 		}
// 	}
//
// 	/**
// 	 * Subscribes to the metadata manager.
// 	 *
// 	 * @param uuid
// 	 * @param callbackSignal
// 	 * @param bindTarget
// 	 * @param onDelete
// 	 */
// 	public subscribe(
// 		uuid: string,
// 		callbackSignal: Signal<unknown>,
// 		bindTarget: BindTargetDeclaration,
// 		onDelete: () => void,
// 	): MetadataSubscription {
// 		const subscription: MetadataSubscription = new MetadataSubscription(
// 			uuid,
// 			callbackSignal,
// 			this,
// 			bindTarget,
// 			onDelete,
// 		);
//
// 		this.subscribeSubscription(subscription);
//
// 		return subscription;
// 	}
//
// 	/**
// 	 * Subscribes a computed subscription to the metadata manager.
// 	 *
// 	 * @param uuid
// 	 * @param callbackSignal
// 	 * @param bindTarget
// 	 * @param dependencies
// 	 * @param computeFunction
// 	 * @param onDelete
// 	 */
// 	public subscribeComputed(
// 		uuid: string,
// 		callbackSignal: Signal<unknown>,
// 		bindTarget: BindTargetDeclaration | undefined,
// 		dependencies: ComputedSubscriptionDependency[],
// 		computeFunction: ComputeFunction,
// 		onDelete: () => void,
// 	): ComputedMetadataSubscription {
// 		const subscription: ComputedMetadataSubscription = new ComputedMetadataSubscription(
// 			uuid,
// 			callbackSignal,
// 			this,
// 			bindTarget,
// 			dependencies,
// 			computeFunction,
// 			onDelete,
// 		);
//
// 		this.checkForLoops(subscription);
//
// 		subscription.init();
//
// 		this.subscribeSubscription(subscription);
//
// 		return subscription;
// 	}
//
// 	private checkForLoops(subscription: IMetadataSubscription): void {
// 		for (const dependency of this.getAllSubscriptionsToDependencies(subscription)) {
// 			this.recCheckForLoops([subscription, dependency]);
// 		}
// 	}
//
// 	/**
// 	 * Recursively checks for loops in subscription dependencies
// 	 *
// 	 * @param dependencyPath
// 	 * @private
// 	 */
// 	private recCheckForLoops(dependencyPath: IMetadataSubscription[]): void {
// 		// console.warn('checking for loops', dependencyPath.map(x => `"${bindTargetsToString(x.bindTarget)}"`).join(' -> '));
//
// 		const firstDependency = dependencyPath.first();
// 		const lastDependency = dependencyPath.last();
// 		if (lastDependency === undefined || firstDependency === undefined) {
// 			return;
// 		}
//
// 		if (hasUpdateOverlap(firstDependency.bindTarget, lastDependency.bindTarget)) {
// 			throw new MetaBindBindTargetError({
// 				errorLevel: ErrorLevel.ERROR,
// 				effect: 'bind target dependency loop detected',
// 				cause: `the loop is as follows: ${dependencyPath
// 					.map(x => `"${bindTargetToString(x.bindTarget)}"`)
// 					.join(' -> ')}`,
// 				docs: [
// 					'https://mprojectscode.github.io/obsidian-meta-bind-plugin-docs/guides/viewfields/#circular-dependencies',
// 				],
// 			});
// 		}
//
// 		// console.warn('next step dependencies', this.getAllSubscriptionsToDependencies(lastDependency));
// 		// i need to get all listeners that point to the same bind target for each dependency
// 		for (const dependency of this.getAllSubscriptionsToDependencies(lastDependency)) {
// 			this.recCheckForLoops([...dependencyPath, dependency]);
// 		}
// 	}
//
// 	/**
// 	 * Gets all subscriptions that listen to any of a subscriptions dependencies.
// 	 *
// 	 * @param subscription
// 	 * @private
// 	 */
// 	private getAllSubscriptionsToDependencies(subscription: IMetadataSubscription): IMetadataSubscription[] {
// 		return subscription
// 			.getDependencies()
// 			.map(x => this.getAllSubscriptionsToBindTarget(x.bindTarget))
// 			.flat();
// 	}
//
// 	/**
// 	 * Gets all subscriptions that listen to a specific bind target.
// 	 *
// 	 * @param bindTarget
// 	 * @private
// 	 */
// 	private getAllSubscriptionsToBindTarget(bindTarget: BindTargetDeclaration | undefined): IMetadataSubscription[] {
// 		if (bindTarget === undefined) {
// 			return [];
// 		}
//
// 		const fileCache = this.getCacheForFile(bindTarget.storagePath);
// 		if (!fileCache) {
// 			return [];
// 		}
//
// 		const ret = [];
// 		for (const subscription of fileCache.subscriptions) {
// 			if (hasUpdateOverlap(subscription.bindTarget, bindTarget)) {
// 				ret.push(subscription);
// 			}
// 		}
//
// 		return fileCache.subscriptions.filter(x => hasUpdateOverlap(x.bindTarget, bindTarget));
// 	}
//
// 	/**
// 	 * Unsubscribe a subscription.
// 	 *
// 	 * @param subscription
// 	 */
// 	unsubscribe(subscription: IMetadataSubscription): void {
// 		if (subscription.bindTarget === undefined) {
// 			return;
// 		}
//
// 		const filePath = subscription.bindTarget.storagePath;
//
// 		const fileCache = this.getCacheForFile(filePath);
// 		if (!fileCache) {
// 			return;
// 		}
//
// 		console.debug(
// 			`meta-bind | MetadataManager >> unregistered ${subscription.uuid} to from file cache ${filePath}`,
// 		);
//
// 		fileCache.subscriptions = fileCache.subscriptions.filter(x => x.uuid !== subscription.uuid);
// 		if (fileCache.subscriptions.length === 0) {
// 			console.debug(`meta-bind | MetadataManager >> marked unused file cache as inactive ${filePath}`);
// 			fileCache.inactive = true;
// 		}
// 	}
//
// 	getCacheForFile(filePath: string): MetadataManagerCacheItem | undefined {
// 		return this.cache.get(filePath);
// 	}
//
// 	/**
// 	 * Creates a cache for a file path, throws if the cache already exists.
// 	 *
// 	 * @param filePath
// 	 * @param cache
// 	 */
// 	createCacheForFile(filePath: string, cache: MetadataManagerCacheItem): void {
// 		if (this.cache.has(filePath)) {
// 			throw new MetaBindInternalError({
// 				errorLevel: ErrorLevel.CRITICAL,
// 				effect: 'can not create metadata file cache',
// 				cause: 'cache for file already exists',
// 			});
// 		}
// 		this.cache.set(filePath, cache);
// 	}
//
// 	/**
// 	 * Internal update function that runs each cycle.
// 	 *
// 	 * @private
// 	 */
// 	public cycle(): void {
// 		// console.debug('meta-bind | updating metadata manager');
// 		const markedForDelete: string[] = [];
//
// 		for (const [filePath, cacheEntry] of this.cache) {
// 			// if the entry changed, update the frontmatter of the note
// 			if (cacheEntry.changed) {
// 				void this.updateExternal(filePath, cacheEntry);
// 			}
// 			cacheEntry.cyclesSinceLastChange += 1;
//
// 			// if the cache is inactive, count cycles, then delete the cache
// 			if (cacheEntry.inactive) {
// 				cacheEntry.cyclesSinceInactive += 1;
// 			}
// 			if (cacheEntry.cyclesSinceInactive > METADATA_CACHE_INACTIVE_CYCLE_THRESHOLD) {
// 				markedForDelete.push(filePath);
// 			}
// 		}
//
// 		for (const filePath of markedForDelete) {
// 			this.cache.delete(filePath);
// 		}
// 	}
//
// 	/**
// 	 * Updates the external cached source.
// 	 *
// 	 * @param filePath
// 	 * @param fileCache
// 	 */
// 	async updateExternal(filePath: string, fileCache: MetadataManagerCacheItem): Promise<void> {
// 		// console.debug(`meta-bind | MetadataManager >> updating frontmatter of "${fileCache.file.path}" to`, fileCache.metadata);
// 		try {
// 			await this.metadataAdapter.updateMetadata(filePath, fileCache);
// 		} catch (e) {
// 			fileCache.changed = false;
// 			console.warn('failed to update frontmatter', e);
// 		}
// 	}
//
// 	/**
// 	 * For when a subscription want's to update the cache.
// 	 *
// 	 * @param value
// 	 * @param subscription
// 	 */
// 	updateCache(value: unknown, subscription: IMetadataSubscription): void {
// 		if (subscription.bindTarget === undefined) {
// 			return;
// 		}
//
// 		const storageProp = subscription.bindTarget.storageProp;
// 		const storagePath = subscription.bindTarget.storagePath;
// 		const storageType = subscription.bindTarget.storageType;
//
// 		console.debug(
// 			`meta-bind | MetadataManager >> updating "${JSON.stringify(
// 				storageProp,
// 			)}" in "${storagePath}" metadata cache to`,
// 			value,
// 		);
//
// 		if (storageType === BindTargetStorageType.FRONTMATTER) {
// 			const fileCache = this.getCacheForFile(storagePath);
// 			if (!fileCache) {
// 				return;
// 			}
// 			PropUtils.setAndCreate(fileCache.metadata, storageProp, value);
//
// 			fileCache.cyclesSinceLastChange = 0;
// 			fileCache.changed = true;
//
// 			this.notifyFileCacheListeners(fileCache, BindTargetStorageType.FRONTMATTER, storageProp, subscription.uuid);
// 		} else if (storageType === BindTargetStorageType.MEMORY) {
// 			const fileCache = this.getCacheForFile(storagePath);
// 			if (!fileCache) {
// 				return;
// 			}
// 			PropUtils.setAndCreate(fileCache.memory, storageProp, value);
//
// 			this.notifyFileCacheListeners(fileCache, BindTargetStorageType.MEMORY, storageProp, subscription.uuid);
// 		} else if (storageType === BindTargetStorageType.GLOBAL_MEMORY) {
// 			PropUtils.setAndCreate(this.globalCache.memory, storageProp, value);
//
// 			this.notifyFileCacheListeners(
// 				this.globalCache,
// 				BindTargetStorageType.GLOBAL_MEMORY,
// 				storageProp,
// 				subscription.uuid,
// 			);
// 		}
// 	}
//
// 	/**
// 	 * For when the external cached source updates.
// 	 *
// 	 * @param filePath
// 	 * @param newMetadata
// 	 */
// 	updateCacheOnExternalFrontmatterUpdate(filePath: string, newMetadata: Metadata): void {
// 		const fileCache = this.getCacheForFile(filePath);
// 		if (!fileCache) {
// 			return;
// 		}
//
// 		// don't update if the user recently changed the cache
// 		if (fileCache.cyclesSinceLastChange < METADATA_CACHE_UPDATE_CYCLE_THRESHOLD) {
// 			return;
// 		}
//
// 		const metadata: Record<string, unknown> = structuredClone(newMetadata); // copy
// 		delete metadata.position;
//
// 		console.debug(`meta-bind | MetadataManager >> updating "${filePath}" on frontmatter update`, metadata);
//
// 		fileCache.metadata = metadata;
//
// 		this.notifyFileCacheListeners(fileCache, BindTargetStorageType.FRONTMATTER);
// 	}
//
// 	/**
// 	 * Notifies all subscriptions except a certain except id to prevent infinite loops.
// 	 *
// 	 * @param fileCache
// 	 * @param storageType
// 	 * @param storageProp if undefined, notifies all subscriptions
// 	 * @param exceptUuid
// 	 */
// 	notifyFileCacheListeners(
// 		fileCache: IMetadataManagerCache,
// 		storageType: BindTargetStorageType,
// 		storageProp?: PropPath | undefined,
// 		exceptUuid?: string | undefined,
// 	): void {
// 		// console.log(fileCache);
//
// 		for (const subscription of fileCache.subscriptions) {
// 			if (exceptUuid && exceptUuid === subscription.uuid) {
// 				continue;
// 			}
//
// 			if (subscription.bindTarget === undefined) {
// 				continue;
// 			}
//
// 			if (subscription.bindTarget.storageType !== storageType) {
// 				continue;
// 			}
//
// 			if (storageProp) {
// 				if (
// 					metadataPathHasUpdateOverlap(
// 						storageProp.toStringArray(),
// 						subscription.bindTarget.storageProp.toStringArray(),
// 						subscription.bindTarget.listenToChildren,
// 					)
// 				) {
// 					const value: unknown = this.getPropertyFromCache(
// 						fileCache,
// 						subscription.bindTarget.storageType,
// 						subscription.bindTarget.storageProp,
// 					);
// 					console.debug(
// 						`meta-bind | MetadataManager >> notifying input field ${subscription.uuid} of updated metadata value`,
// 						value,
// 					);
// 					subscription.notify(value);
// 				}
// 			} else {
// 				const value: unknown = this.getPropertyFromCache(
// 					fileCache,
// 					subscription.bindTarget.storageType,
// 					subscription.bindTarget.storageProp,
// 				);
// 				console.debug(
// 					`meta-bind | MetadataManager >> notifying input field ${subscription.uuid} of updated metadata`,
// 					subscription.bindTarget.storageProp,
// 					fileCache.metadata,
// 					value,
// 				);
// 				subscription.notify(value);
// 			}
// 		}
// 	}
//
// 	deleteCacheInstantly(filePath: string): void {
// 		const cacheItem = this.getCacheForFile(filePath);
// 		if (cacheItem === undefined) {
// 			return;
// 		}
//
// 		for (const subscription of cacheItem.subscriptions) {
// 			subscription.delete();
// 		}
//
// 		this.cache.delete(filePath);
// 	}
//
// 	private getPropertyFromCache(
// 		cache: IMetadataManagerCache,
// 		storageType: BindTargetStorageType,
// 		storageProp: PropPath,
// 	): unknown {
// 		if (storageType === BindTargetStorageType.FRONTMATTER) {
// 			return PropUtils.tryGet(cache.metadata, storageProp);
// 		} else if (storageType === BindTargetStorageType.MEMORY) {
// 			return PropUtils.tryGet(cache.memory, storageProp);
// 		} else if (storageType === BindTargetStorageType.GLOBAL_MEMORY) {
// 			if (this.globalCache !== cache) {
// 				throw new MetaBindInternalError({
// 					errorLevel: ErrorLevel.CRITICAL,
// 					effect: 'can not get property from cache',
// 					cause: 'cache is not the global cache',
// 				});
// 			}
//
// 			return PropUtils.tryGet(cache.memory, storageProp);
// 		}
//
// 		throw new MetaBindInternalError({
// 			errorLevel: ErrorLevel.CRITICAL,
// 			effect: 'can not get property from cache',
// 			cause: `bind target storage type "${storageType}" is not supported`,
// 		});
// 	}
// }

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

	return metadataPathHasUpdateOverlap(
		a.storageProp.toStringArray(),
		b.storageProp.toStringArray(),
		b.listenToChildren,
	);
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
export function metadataPathHasUpdateOverlap(a: string[], b: string[], listenToChildren: boolean): boolean {
	if (areArraysEqual(a, b)) {
		return true;
	}

	if (arrayStartsWith(b, a)) {
		return true;
	}

	return listenToChildren && arrayStartsWith(a, b);
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

		source.unsubscribe(subscription);
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

		// TODO: remove
		console.log('meta-bind | MetadataManager >> subscribed', subscription, cacheItem);

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

		const firstDependency = dependencyPath.first();
		const lastDependency = dependencyPath.last();
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
				source.delete(cacheItem);
			}
		}
	}

	/**
	 * Update the cache for a subscription.
	 *
	 * @param value
	 * @param subscription
	 */
	public update(value: unknown, subscription: IMetadataSubscription): void {
		if (subscription.bindTarget === undefined) {
			return;
		}

		const source = this.getSource(subscription.bindTarget.storageType);
		if (source === undefined) {
			throw new MetaBindInternalError({
				errorLevel: ErrorLevel.ERROR,
				effect: 'can not update metadata',
				cause: `Source "${subscription.bindTarget.storageType}" does not exist`,
			});
		}

		// console.log('meta-bind | MetadataManager >> internal update', source.id, subscription.bindTarget, value);

		const cacheItem = source.update(value, subscription);
		cacheItem.pendingInternalChange = true;
		cacheItem.cyclesSinceInternalChange = 0;
		this.notifyListeners(source, subscription);
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
	 * Notifies all listeners that overlap in the bind target with the subscription provided.
	 *
	 * @param source
	 * @param subscription
	 * @private
	 */
	private notifyListeners(source: MetadataSource, subscription: IMetadataSubscription): void {
		if (subscription.bindTarget === undefined) {
			return;
		}

		const cacheItem = source.getCacheItemForStoragePath(subscription.bindTarget.storagePath);
		if (cacheItem === undefined) {
			return;
		}

		for (const cacheSubscription of cacheItem.subscriptions) {
			if (subscription.uuid === cacheSubscription.uuid || cacheSubscription.bindTarget === undefined) {
				continue;
			}

			if (
				metadataPathHasUpdateOverlap(
					subscription.bindTarget.storageProp.toStringArray(),
					cacheSubscription.bindTarget.storageProp.toStringArray(),
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
	 * Instantly deletes all caches for a given storage path.
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
			source.delete(cacheItem);
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
		// console.log('meta-bind | MetadataManager >> external update', source.id, storagePath, value);

		const cacheItem = source.getCacheItemForStoragePath(storagePath);
		if (cacheItem === undefined || this.isCacheExternalWriteLocked(cacheItem)) {
			return;
		}

		source.updateEntireCache(value, cacheItem);
		this.notifyAllListeners(source, cacheItem);
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

import { areArraysEqual, arrayStartsWith } from '../utils/Utils';
import { type Signal } from '../utils/Signal';
import { type Metadata, type MetadataManagerCacheItem } from './MetadataManagerCacheItem';
import { ErrorLevel, MetaBindBindTargetError, MetaBindInternalError } from '../utils/errors/MetaBindErrors';
import { type IMetadataAdapter } from './IMetadataAdapter';
import { type IMetadataSubscription } from './IMetadataSubscription';
import { MetadataSubscription } from './MetadataSubscription';
import {
	ComputedMetadataSubscription,
	type ComputedSubscriptionDependency,
	type ComputeFunction,
} from './ComputedMetadataSubscription';
import { PropUtils } from '../utils/prop/PropUtils';
import { type PropPath } from '../utils/prop/PropPath';
import { type BindTargetDeclaration, BindTargetStorageType } from '../parsers/BindTargetDeclaration';

export const METADATA_CACHE_UPDATE_CYCLE_THRESHOLD = 5; // {syncInterval (200)} * 5 = 1s
export const METADATA_CACHE_INACTIVE_CYCLE_THRESHOLD = 5 * 60; // {syncInterval (200)} * 5 * 60 = 1 minute

/**
 * Checks if bind target `b` should receive an update when bind target `a` changes.
 *
 * @param a
 * @param b
 */
function hasUpdateOverlap(a: BindTargetDeclaration | undefined, b: BindTargetDeclaration | undefined): boolean {
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
function metadataPathHasUpdateOverlap(a: string[], b: string[], listenToChildren: boolean): boolean {
	if (areArraysEqual(a, b)) {
		return true;
	}

	if (arrayStartsWith(b, a)) {
		return true;
	}

	return listenToChildren && arrayStartsWith(a, b);
}

function bindTargetToString(a: BindTargetDeclaration | undefined): string {
	if (a === undefined) {
		return 'undefined';
	}

	return `${a.storagePath}#${a.storageProp.toString()}`;
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

		if (subscription.bindTarget?.storageType === BindTargetStorageType.LOCAL) {
			// local scope should be resolved by the time the subscription is created
			throw new MetaBindInternalError({
				errorLevel: ErrorLevel.CRITICAL,
				effect: 'can not subscribe subscription',
				cause: 'local scope should be resolved by the time the subscription is created',
			});
		}

		const fileCache: MetadataManagerCacheItem | undefined = this.getCacheForFile(
			subscription.bindTarget.storagePath,
		);

		if (fileCache) {
			console.debug(
				`meta-bind | MetadataManager >> registered ${subscription.uuid} to existing file cache ${
					subscription.bindTarget.storagePath
				} -> ${subscription.bindTarget.storageProp.toString()}`,
			);

			fileCache.inactive = false;
			fileCache.cyclesSinceInactive = 0;
			fileCache.subscriptions.push(subscription);

			subscription.notify(PropUtils.tryGet(fileCache.metadata, subscription.bindTarget.storageProp));
		} else {
			console.debug(
				`meta-bind | MetadataManager >> registered ${subscription.uuid} to newly created file cache ${
					subscription.bindTarget.storagePath
				} -> ${subscription.bindTarget.storageProp.toString()}`,
			);

			// const file = this.plugin.app.vault.getAbstractFileByPath(subscription.bindTarget.filePath) as TFile;
			// const frontmatter = this.plugin.app.metadataCache.getFileCache(file)?.frontmatter;
			const { metadata, extraCache } = this.metadataAdapter.getMetadataAndExtraCache(subscription);

			const newCache: MetadataManagerCacheItem = {
				extraCache: extraCache,
				metadata: metadata,
				memory: {},
				subscriptions: [subscription],
				cyclesSinceLastChange: METADATA_CACHE_UPDATE_CYCLE_THRESHOLD + 1, // +1, so that is it bigger than the threshold
				cyclesSinceInactive: 0,
				inactive: false,
				changed: false,
			};

			console.log(
				`meta-bind | MetadataManager >> loaded metadata for file ${subscription.bindTarget.storagePath}`,
				newCache.metadata,
			);

			subscription.notify(PropUtils.tryGet(newCache.metadata, subscription.bindTarget.storageProp));

			this.createCacheForFile(subscription.bindTarget.storagePath, newCache);
		}
	}

	/**
	 * Subscribes to the metadata manager.
	 *
	 * @param uuid
	 * @param callbackSignal
	 * @param bindTarget
	 * @param onDelete
	 */
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
	 * Subscribes a computed subscription to the metadata manager.
	 *
	 * @param uuid
	 * @param callbackSignal
	 * @param bindTarget
	 * @param dependencies
	 * @param computeFunction
	 * @param onDelete
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

		const fileCache = this.getCacheForFile(bindTarget.storagePath);
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
	 * Unsubscribe a subscription.
	 *
	 * @param subscription
	 */
	unsubscribe(subscription: IMetadataSubscription): void {
		if (subscription.bindTarget === undefined) {
			return;
		}

		const filePath = subscription.bindTarget.storagePath;

		const fileCache = this.getCacheForFile(filePath);
		if (!fileCache) {
			return;
		}

		console.debug(
			`meta-bind | MetadataManager >> unregistered ${subscription.uuid} to from file cache ${filePath}`,
		);

		fileCache.subscriptions = fileCache.subscriptions.filter(x => x.uuid !== subscription.uuid);
		if (fileCache.subscriptions.length === 0) {
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
			throw new MetaBindInternalError({
				errorLevel: ErrorLevel.CRITICAL,
				effect: 'can not create metadata file cache',
				cause: 'cache for file already exists',
			});
		}
		this.cache.set(filePath, cache);
	}

	/**
	 * Internal update function that runs each cycle.
	 *
	 * @private
	 */
	public cycle(): void {
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
			if (cacheEntry.cyclesSinceInactive > METADATA_CACHE_INACTIVE_CYCLE_THRESHOLD) {
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
	 * @param filePath
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

		const metadataPath = subscription.bindTarget.storageProp;
		const filePath = subscription.bindTarget.storagePath;

		console.debug(
			`meta-bind | MetadataManager >> updating "${JSON.stringify(
				metadataPath,
			)}" in "${filePath}" metadata cache to`,
			value,
		);

		const fileCache = this.getCacheForFile(filePath);
		if (!fileCache) {
			return;
		}

		// TODO: update the correct storage location
		PropUtils.setAndCreate(fileCache.metadata, metadataPath, value);

		fileCache.cyclesSinceLastChange = 0;
		fileCache.changed = true;

		// TODO: notify only the subscriptions that match the storage location
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
		if (fileCache.cyclesSinceLastChange < METADATA_CACHE_UPDATE_CYCLE_THRESHOLD) {
			return;
		}

		const metadata: Record<string, unknown> = Object.assign({}, newMetadata); // copy
		delete metadata.position;

		console.debug(`meta-bind | MetadataManager >> updating "${filePath}" on frontmatter update`, metadata);

		fileCache.metadata = metadata;

		// TODO: only update subscriptions that match the storage location
		this.notifyListeners(fileCache);
	}

	/**
	 * Notifies all subscriptions except a certain except id to prevent infinite loops.
	 *
	 * @param fileCache
	 * @param metadataPath
	 * @param exceptUuid
	 */
	notifyListeners(
		fileCache: MetadataManagerCacheItem,
		metadataPath?: PropPath | undefined,
		exceptUuid?: string | undefined,
	): void {
		// console.log(fileCache);

		for (const subscription of fileCache.subscriptions) {
			if (exceptUuid && exceptUuid === subscription.uuid) {
				continue;
			}

			if (subscription.bindTarget === undefined) {
				continue;
			}

			if (metadataPath) {
				if (
					metadataPathHasUpdateOverlap(
						metadataPath.toStringArray(),
						subscription.bindTarget.storageProp.toStringArray(),
						subscription.bindTarget.listenToChildren,
					)
				) {
					const value: unknown = PropUtils.tryGet(fileCache.metadata, subscription.bindTarget.storageProp);
					console.debug(
						`meta-bind | MetadataManager >> notifying input field ${subscription.uuid} of updated metadata value`,
						value,
					);
					subscription.notify(value);
				}
			} else {
				const value: unknown = PropUtils.tryGet(fileCache.metadata, subscription.bindTarget.storageProp);
				console.debug(
					`meta-bind | MetadataManager >> notifying input field ${subscription.uuid} of updated metadata`,
					subscription.bindTarget.storageProp,
					fileCache.metadata,
					value,
				);
				subscription.notify(value);
			}
		}
	}

	deleteCacheInstantly(filePath: string): void {
		const cacheItem = this.getCacheForFile(filePath);
		if (cacheItem === undefined) {
			return;
		}

		for (const subscription of cacheItem.subscriptions) {
			subscription.delete();
		}

		this.cache.delete(filePath);
	}
}

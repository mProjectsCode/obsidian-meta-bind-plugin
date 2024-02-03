import { type IMetadataSubscription } from './IMetadataSubscription';
import { type BindTargetDeclaration } from '../parsers/bindTargetParser/BindTargetDeclaration';
import { ErrorLevel, MetaBindInternalError } from '../utils/errors/MetaBindErrors';
import { type MetadataManager } from './MetadataManager';
import { PropUtils } from '../utils/prop/PropUtils';
import { type IMetadataCacheItem, type FilePathMetadataCacheItem } from './MetadataCacheItem';
import { type PropPath } from '../utils/prop/PropPath';
import { type ParsingResultNode } from '../parsers/nomParsers/GeneralNomParsers';
import { type BindTargetParser } from '../parsers/bindTargetParser/BindTargetParser';
import { type BindTargetScope } from './BindTargetScope';

export type Metadata = Record<string, unknown>;

export interface IMetadataSource<T extends IMetadataCacheItem> {
	readonly id: string;
	readonly manager: MetadataManager;

	validateStoragePath(
		storagePath: ParsingResultNode,
		hadStoragePath: boolean,
		bindTargetDeclaration: string,
		parser: BindTargetParser,
	): string;

	resolveBindTargetScope(
		bindTargetDeclaration: BindTargetDeclaration,
		scope: BindTargetScope | undefined,
		parser: BindTargetParser,
	): BindTargetDeclaration;

	/**
	 * Subscribes a subscription to the metadata source.
	 *
	 * @param subscription
	 * @returns The cache item for the subscription.
	 */
	subscribe(subscription: IMetadataSubscription): T;
	/**
	 * Unsubscribes a subscription from the metadata source.
	 *
	 * @param subscription
	 * @returns The cache item for the subscription.
	 */
	unsubscribe(subscription: IMetadataSubscription): T;
	/**
	 * Gets the cache item for a storage path.
	 *
	 * @param storagePath
	 * @returns The cache item for the storage path.
	 */
	getCacheItemForStoragePath(storagePath: string): T | undefined;
	/**
	 * Called when the cache item is cycled.
	 *
	 * @param cacheItem
	 */
	onCycle(cacheItem: T): void;
	/**
	 * Iterates over all cache items.
	 */
	iterateCacheItems(): IterableIterator<T>;
	/**
	 * Can be used to stop the deletion of a cache item.
	 *
	 * @param cacheItem
	 */
	shouldDelete(cacheItem: T): boolean;
	/**
	 * Deletes a cache item.
	 *
	 * @param cacheItem
	 */
	delete(cacheItem: T): void;
	/**
	 * Synchronizes the cache item with the external source.
	 *
	 * @param cacheItem
	 */
	syncExternal(cacheItem: T): void;
	/**
	 * Updates the cache item with the given value.
	 * This is an internal update.
	 *
	 * @param value
	 * @param subscription
	 * @returns The cache item for the subscription.
	 */
	update(value: unknown, subscription: IMetadataSubscription): T;
	/**
	 * Updates the entire cache item with the given value.
	 * This is an internal update.
	 *
	 * @param value
	 * @param cacheItem
	 */
	updateEntireCache(value: Metadata, cacheItem: T): void;
	/**
	 * Reads the cache item for the given bind target.
	 *
	 * @param bindTarget
	 * @returns The value of the prop in the cache item that the bind target points to.
	 */
	readCache(bindTarget: BindTargetDeclaration): unknown;
	/**
	 * Reads the cache item.
	 *
	 * @param cacheItem
	 * @param propPath
	 * @returns The value of the prop in the cache item that the prop path points to.
	 */
	readCacheItem(cacheItem: T, propPath: PropPath): unknown;
	/**
	 * Reads the entire cache item.
	 *
	 * @param cacheItem
	 * @returns The entire data of the cache item.
	 */
	readEntireCacheItem(cacheItem: T): Metadata;
}

export abstract class FilePathMetadataSource<T extends FilePathMetadataCacheItem> implements IMetadataSource<T> {
	public readonly id: string;
	public readonly manager: MetadataManager;
	public readonly cache: Map<string, T>;

	constructor(id: string, manager: MetadataManager) {
		this.id = id;
		this.manager = manager;
		this.cache = new Map<string, T>();
	}

	public validateStoragePath(
		storagePath: ParsingResultNode,
		_hadStoragePath: boolean,
		bindTargetDeclaration: string,
		parser: BindTargetParser,
	): string {
		return parser.validateStoragePathAsFilePath(storagePath, bindTargetDeclaration);
	}

	public resolveBindTargetScope(
		bindTargetDeclaration: BindTargetDeclaration,
		_scope: BindTargetScope | undefined,
		_parser: BindTargetParser,
	): BindTargetDeclaration {
		return bindTargetDeclaration;
	}

	abstract getDefaultCacheItem(storagePath: string): T;

	subscribe(subscription: IMetadataSubscription): T {
		if (subscription.bindTarget === undefined) {
			throw new MetaBindInternalError({
				errorLevel: ErrorLevel.CRITICAL,
				effect: 'can not subscribe',
				cause: 'subscription bind target undefined',
			});
		}

		let cacheItem = this.cache.get(subscription.bindTarget.storagePath);
		if (cacheItem === undefined) {
			cacheItem = this.getDefaultCacheItem(subscription.bindTarget.storagePath);
			this.cache.set(subscription.bindTarget.storagePath, cacheItem);
		}

		cacheItem.subscriptions.push(subscription);

		return cacheItem;
	}

	unsubscribe(subscription: IMetadataSubscription): T {
		if (subscription.bindTarget === undefined) {
			throw new MetaBindInternalError({
				errorLevel: ErrorLevel.CRITICAL,
				effect: 'can not unsubscribe',
				cause: 'subscription bind target undefined',
			});
		}

		const cacheItem = this.cache.get(subscription.bindTarget.storagePath);
		if (cacheItem === undefined) {
			throw new MetaBindInternalError({
				errorLevel: ErrorLevel.CRITICAL,
				effect: 'can not unsubscribe',
				cause: 'cache item does not exist',
			});
		}

		cacheItem.subscriptions = cacheItem.subscriptions.filter(x => x.uuid !== subscription.uuid);

		return cacheItem;
	}

	getCacheItemForStoragePath(storagePath: string): T | undefined {
		return this.cache.get(storagePath);
	}

	onCycle(_cacheItem: T): void {
		// noop
	}

	iterateCacheItems(): IterableIterator<T> {
		return this.cache.values();
	}

	shouldDelete(_cacheItem: T): boolean {
		return true;
	}

	delete(cacheItem: T): void {
		this.cache.delete(cacheItem.storagePath);
	}

	abstract syncExternal(cacheItem: T): void;

	update(value: unknown, subscription: IMetadataSubscription): T {
		if (subscription.bindTarget === undefined) {
			throw new MetaBindInternalError({
				errorLevel: ErrorLevel.CRITICAL,
				effect: 'can not update metadata',
				cause: 'subscription bind target undefined',
			});
		}

		const cacheItem = this.cache.get(subscription.bindTarget.storagePath);
		if (cacheItem === undefined) {
			throw new MetaBindInternalError({
				errorLevel: ErrorLevel.CRITICAL,
				effect: 'can not update metadata',
				cause: 'cache item does not exist',
			});
		}

		PropUtils.setAndCreate(cacheItem.data, subscription.bindTarget.storageProp, value);

		return cacheItem;
	}

	updateEntireCache(value: Metadata, cacheItem: T): void {
		cacheItem.data = value;
	}

	readCache(bindTarget: BindTargetDeclaration): unknown {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
		if (bindTarget.storageType !== this.id) {
			throw new MetaBindInternalError({
				errorLevel: ErrorLevel.ERROR,
				effect: 'can not read cache',
				cause: `Source "${bindTarget.storageType}" does not match`,
			});
		}

		const cacheItem = this.getCacheItemForStoragePath(bindTarget.storagePath);

		if (cacheItem === undefined) {
			throw new MetaBindInternalError({
				errorLevel: ErrorLevel.ERROR,
				effect: 'can not read cache',
				cause: `Cache item for path "${bindTarget.storagePath}" does not exist or is not loaded`,
			});
		}

		return this.readCacheItem(cacheItem, bindTarget.storageProp);
	}

	readCacheItem(cacheItem: T, propPath: PropPath): unknown {
		return PropUtils.tryGet(cacheItem.data, propPath);
	}

	readEntireCacheItem(cacheItem: T): Metadata {
		return cacheItem.data;
	}
}

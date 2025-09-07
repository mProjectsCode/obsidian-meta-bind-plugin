import type { BindTargetScope } from 'packages/core/src/metadata/BindTargetScope';
import type { IMetadataSubscription } from 'packages/core/src/metadata/IMetadataSubscription';
import type { FilePathMetadataCacheItem, IMetadataCacheItem } from 'packages/core/src/metadata/MetadataCacheItem';
import type { MetadataManager } from 'packages/core/src/metadata/MetadataManager';
import type { BindTargetDeclaration } from 'packages/core/src/parsers/bindTargetParser/BindTargetDeclaration';
import type { BindTargetParser } from 'packages/core/src/parsers/bindTargetParser/BindTargetParser';
import type { ParsingResultNode } from 'packages/core/src/parsers/nomParsers/GeneralNomParsers';
import { ErrorLevel, MetaBindInternalError } from 'packages/core/src/utils/errors/MetaBindErrors';
import type { PropPath } from 'packages/core/src/utils/prop/PropPath';
import { PropUtils } from 'packages/core/src/utils/prop/PropUtils';

export type Metadata = Record<string, unknown>;

export interface IMetadataSource<T extends IMetadataCacheItem> {
	readonly id: string;
	readonly manager: MetadataManager;

	/**
	 * Validates if a storage path is valid for the source.
	 *
	 * @param storagePath
	 * @param hadStoragePath
	 * @param bindTargetDeclaration
	 * @param parser
	 */
	validateStoragePath(
		storagePath: ParsingResultNode,
		hadStoragePath: boolean,
		bindTargetDeclaration: string | undefined,
		parser: BindTargetParser,
	): string;

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
	 * Gets the cache item for the given storage path.
	 * If the cache item does not exist, it is created.
	 *
	 * @param storagePath
	 */
	getOrCreateCacheItem(storagePath: string): T;

	/**
	 * Called when the cache item is cycled.
	 *
	 * @param cacheItem
	 */
	onCycle(cacheItem: T): void;

	/**
	 * Get all cache items as an array, so that it can e.g. be iterated over.
	 */
	getCacheItems(): T[];

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
	deleteCache(cacheItem: T): void;

	/**
	 * Synchronizes the cache item with the external source.
	 *
	 * @param cacheItem
	 */
	syncExternal(cacheItem: T): Promise<void>;

	/**
	 * Updates the cache item with the given value.
	 * This is an internal update.
	 * This should **not** fail if the cache item does not exist.
	 *
	 * @param value
	 * @param bindTarget
	 * @returns The cache item for the bind target.
	 */
	writeCache(value: unknown, bindTarget: BindTargetDeclaration): T;

	/**
	 * Updates the entire cache item with the given value.
	 * This is an internal update.
	 *
	 * @param value
	 * @param cacheItem
	 */
	writeEntireCache(value: Metadata, cacheItem: T): void;

	/**
	 * Reads the cache item for the given bind target.
	 * This should **not** fail if the cache item does not exist.
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

	usesStoragePath(): boolean;
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

	abstract readExternal(storagePath: string): Metadata;

	getOrCreateCacheItem(storagePath: string): T {
		let cacheItem = this.getCacheItemForStoragePath(storagePath);

		if (cacheItem === undefined) {
			cacheItem = this.getDefaultCacheItem(storagePath);
			this.cache.set(storagePath, cacheItem);
		}

		return cacheItem;
	}

	subscribe(subscription: IMetadataSubscription): T {
		if (subscription.bindTarget === undefined) {
			throw new MetaBindInternalError({
				errorLevel: ErrorLevel.CRITICAL,
				effect: 'can not subscribe',
				cause: 'subscription bind target undefined',
			});
		}

		const cacheItem = this.getOrCreateCacheItem(subscription.bindTarget.storagePath);

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

	getCacheItems(): T[] {
		return Array.from(this.cache.values());
	}

	shouldDelete(_cacheItem: T): boolean {
		return true;
	}

	deleteCache(cacheItem: T): void {
		this.cache.delete(cacheItem.storagePath);
	}

	abstract syncExternal(cacheItem: T): Promise<void>;

	writeCache(value: unknown, bindTarget: BindTargetDeclaration): T {
		const cacheItem = this.getOrCreateCacheItem(bindTarget.storagePath);

		PropUtils.setAndCreate(cacheItem.data, bindTarget.storageProp, value);

		return cacheItem;
	}

	writeEntireCache(value: Metadata, cacheItem: T): void {
		cacheItem.data = value;
	}

	readCache(bindTarget: BindTargetDeclaration): unknown {
		if (bindTarget.storageType !== this.id) {
			throw new MetaBindInternalError({
				errorLevel: ErrorLevel.ERROR,
				effect: 'can not read cache',
				cause: `Source "${bindTarget.storageType}" does not match`,
			});
		}

		const cacheItem = this.getCacheItemForStoragePath(bindTarget.storagePath);

		if (cacheItem === undefined) {
			return PropUtils.tryGet(this.readExternal(bindTarget.storagePath), bindTarget.storageProp);
		}

		return this.readCacheItem(cacheItem, bindTarget.storageProp);
	}

	readCacheItem(cacheItem: T, propPath: PropPath): unknown {
		return PropUtils.tryGet(cacheItem.data, propPath);
	}

	readEntireCacheItem(cacheItem: T): Metadata {
		return cacheItem.data;
	}

	usesStoragePath(): boolean {
		return true;
	}
}

import type { IMetadataSubscription } from 'packages/core/src/metadata/IMetadataSubscription';
import type {
	FilePathMetadataCacheItem,
	GlobalMetadataCacheItem,
	IMetadataCacheItem,
} from 'packages/core/src/metadata/MetadataCacheItem';
import type { MetadataManager } from 'packages/core/src/metadata/MetadataManager';
import type { IMetadataSource, Metadata } from 'packages/core/src/metadata/MetadataSource';
import { FilePathMetadataSource } from 'packages/core/src/metadata/MetadataSource';
import type { BindTargetDeclaration } from 'packages/core/src/parsers/bindTargetParser/BindTargetDeclaration';
import type { BindTargetParser } from 'packages/core/src/parsers/bindTargetParser/BindTargetParser';
import type { ParsingResultNode } from 'packages/core/src/parsers/nomParsers/GeneralNomParsers';
import { ParsingValidationError } from 'packages/core/src/parsers/ParsingError';
import { ErrorLevel, MetaBindInternalError } from 'packages/core/src/utils/errors/MetaBindErrors';
import type { PropPath } from 'packages/core/src/utils/prop/PropPath';
import { PropUtils } from 'packages/core/src/utils/prop/PropUtils';

export class InternalMetadataSource extends FilePathMetadataSource<FilePathMetadataCacheItem> {
	public readExternal(_storagePath: string): Metadata {
		return {};
	}

	public getDefaultCacheItem(storagePath: string): FilePathMetadataCacheItem {
		return {
			data: {},
			storagePath: storagePath,
			...this.manager.getDefaultCacheItem(),
		};
	}

	public syncExternal(_cacheItem: FilePathMetadataCacheItem): void {
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

	public getOrCreateCacheItem(_storagePath: string): GlobalMetadataCacheItem {
		return this.cache;
	}

	public validateStoragePath(
		storagePath: ParsingResultNode,
		hadStoragePath: boolean,
		bindTargetDeclaration: string | undefined,
		_parser: BindTargetParser,
	): string {
		if (hadStoragePath) {
			throw new ParsingValidationError(
				ErrorLevel.ERROR,
				'Bind target validator',
				`Failed to parse bind target. Bind target storage type 'global_memory' does not support a storage path.`,
				bindTargetDeclaration,
				storagePath.position,
			);
		}
		return '';
	}

	public deleteCache(_cacheItem: GlobalMetadataCacheItem): void {
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

	public readCache(bindTarget: BindTargetDeclaration): unknown {
		return this.readCacheItem(this.cache, bindTarget.storageProp);
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

	public writeCache(value: unknown, bindTarget: BindTargetDeclaration): GlobalMetadataCacheItem {
		PropUtils.setAndCreate(this.cache.data, bindTarget.storageProp, value);

		return this.cache;
	}

	public writeEntireCache(value: Metadata, cacheItem: GlobalMetadataCacheItem): void {
		cacheItem.data = value;
	}

	public readEntireCacheItem(cacheItem: GlobalMetadataCacheItem): Metadata {
		return cacheItem.data;
	}
}

export class ScopeMetadataSource implements IMetadataSource<IMetadataCacheItem> {
	public readonly id: string;
	public readonly manager: MetadataManager;

	constructor(id: string, manager: MetadataManager) {
		this.id = id;
		this.manager = manager;
	}

	public getOrCreateCacheItem(_storagePath: string): IMetadataCacheItem {
		throw new MetaBindInternalError({
			errorLevel: ErrorLevel.CRITICAL,
			effect: 'action not permitted',
			cause: `source 'scope' should have no cache items or subscriptions`,
		});
	}

	public validateStoragePath(
		storagePath: ParsingResultNode,
		hadStoragePath: boolean,
		bindTargetDeclaration: string | undefined,
		_parser: BindTargetParser,
	): string {
		if (hadStoragePath) {
			throw new ParsingValidationError(
				ErrorLevel.ERROR,
				'Bind Target Validator',
				`Failed to parse bind target. Bind target storage type 'scope' does not support a storage path.`,
				bindTargetDeclaration,
				storagePath.position,
			);
		}
		return '';
	}

	public deleteCache(_cacheItem: IMetadataCacheItem): void {
		// noop
	}

	public getCacheItemForStoragePath(_storagePath: string): IMetadataCacheItem | undefined {
		return undefined;
	}

	public iterateCacheItems(): IterableIterator<IMetadataCacheItem> {
		return [][Symbol.iterator]();
	}

	public onCycle(_cacheItem: IMetadataCacheItem): void {
		// noop
	}

	public readCache(_bindTarget: BindTargetDeclaration): unknown {
		return undefined;
	}

	public readCacheItem(_cacheItem: IMetadataCacheItem, _propPath: PropPath): unknown {
		return undefined;
	}

	public shouldDelete(_cacheItem: IMetadataCacheItem): boolean {
		return true;
	}

	public subscribe(_subscription: IMetadataSubscription): IMetadataCacheItem {
		throw new MetaBindInternalError({
			errorLevel: ErrorLevel.CRITICAL,
			effect: 'action not permitted',
			cause: `source 'scope' should have no cache items or subscriptions`,
		});
	}

	public syncExternal(_cacheItem: IMetadataCacheItem): void {
		// noop
	}

	public unsubscribe(_subscription: IMetadataSubscription): IMetadataCacheItem {
		throw new MetaBindInternalError({
			errorLevel: ErrorLevel.CRITICAL,
			effect: 'action not permitted',
			cause: `source 'scope' should have no cache items or subscriptions`,
		});
	}

	public writeCache(_value: unknown, _bindTarget: BindTargetDeclaration): IMetadataCacheItem {
		throw new MetaBindInternalError({
			errorLevel: ErrorLevel.CRITICAL,
			effect: 'action not permitted',
			cause: `source 'scope' should have no cache items or subscriptions`,
		});
	}

	public writeEntireCache(_value: Metadata, _cacheItem: IMetadataCacheItem): void {
		// noop
	}

	public readEntireCacheItem(_cacheItem: IMetadataCacheItem): Metadata {
		throw new MetaBindInternalError({
			errorLevel: ErrorLevel.CRITICAL,
			effect: 'action not permitted',
			cause: `source 'scope' should have no cache items or subscriptions`,
		});
	}
}

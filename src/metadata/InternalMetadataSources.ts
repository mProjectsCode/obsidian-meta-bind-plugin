import { type IMetadataSource, FilePathMetadataSource, type Metadata } from './MetadataSource';
import {
	type GlobalMetadataCacheItem,
	type FilePathMetadataCacheItem,
	type IMetadataCacheItem,
} from './MetadataCacheItem';
import { type MetadataManager } from './MetadataManager';
import { type BindTargetDeclaration } from '../parsers/bindTargetParser/BindTargetDeclaration';
import { type PropPath } from '../utils/prop/PropPath';
import { type IMetadataSubscription } from './IMetadataSubscription';
import { PropUtils } from '../utils/prop/PropUtils';
import { ErrorLevel, MetaBindInternalError } from '../utils/errors/MetaBindErrors';
import { type ParsingResultNode } from '../parsers/nomParsers/GeneralNomParsers';
import { type BindTargetParser } from '../parsers/bindTargetParser/BindTargetParser';
import { ParsingValidationError } from '../parsers/ParsingError';
import { type BindTargetScope } from './BindTargetScope';

export class InternalMetadataSource extends FilePathMetadataSource<FilePathMetadataCacheItem> {
	public getDefaultCacheItem(storagePath: string): FilePathMetadataCacheItem {
		return {
			data: {},
			storagePath: storagePath,
			...this.manager.getDefaultCacheItem(),
		};
	}

	public async syncExternal(_cacheItem: FilePathMetadataCacheItem): Promise<void> {
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

	public validateStoragePath(
		storagePath: ParsingResultNode,
		hadStoragePath: boolean,
		bindTargetDeclaration: string,
		_parser: BindTargetParser,
	): string {
		if (hadStoragePath) {
			throw new ParsingValidationError(
				ErrorLevel.ERROR,
				'Bind Target Validator',
				`Failed to parse bind target. Bind target storage type 'global_memory' does not support a storage path.`,
				bindTargetDeclaration,
				storagePath.position,
			);
		}
		return '';
	}

	public resolveBindTargetScope(
		bindTargetDeclaration: BindTargetDeclaration,
		_scope: BindTargetScope | undefined,
		_parser: BindTargetParser,
	): BindTargetDeclaration {
		return bindTargetDeclaration;
	}

	public delete(_cacheItem: GlobalMetadataCacheItem): void {
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

	public readCache(_bindTarget: BindTargetDeclaration): unknown {
		return this.readCacheItem(this.cache, _bindTarget.storageProp);
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

	public update(value: unknown, subscription: IMetadataSubscription): GlobalMetadataCacheItem {
		if (subscription.bindTarget === undefined) {
			throw new MetaBindInternalError({
				errorLevel: ErrorLevel.CRITICAL,
				effect: 'can not update metadata',
				cause: 'subscription bind target undefined',
			});
		}

		PropUtils.setAndCreate(this.cache.data, subscription.bindTarget.storageProp, value);

		return this.cache;
	}

	public updateEntireCache(value: Metadata, cacheItem: GlobalMetadataCacheItem): void {
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

	public validateStoragePath(
		storagePath: ParsingResultNode,
		hadStoragePath: boolean,
		bindTargetDeclaration: string,
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

	public resolveBindTargetScope(
		bindTargetDeclaration: BindTargetDeclaration,
		scope: BindTargetScope | undefined,
		parser: BindTargetParser,
	): BindTargetDeclaration {
		return parser.resolveScope(bindTargetDeclaration, scope);
	}

	public delete(_cacheItem: IMetadataCacheItem): void {
		throw new MetaBindInternalError({
			errorLevel: ErrorLevel.CRITICAL,
			effect: 'action not permitted',
			cause: `source 'scope' should have no cache items or subscriptions`,
		});
	}

	public getCacheItemForStoragePath(_storagePath: string): IMetadataCacheItem | undefined {
		throw new MetaBindInternalError({
			errorLevel: ErrorLevel.CRITICAL,
			effect: 'action not permitted',
			cause: `source 'scope' should have no cache items or subscriptions`,
		});
	}

	public iterateCacheItems(): IterableIterator<IMetadataCacheItem> {
		return [][Symbol.iterator]();
	}

	public onCycle(_cacheItem: IMetadataCacheItem): void {
		// noop
	}

	public readCache(_bindTarget: BindTargetDeclaration): unknown {
		throw new MetaBindInternalError({
			errorLevel: ErrorLevel.CRITICAL,
			effect: 'action not permitted',
			cause: `source 'scope' should have no cache items or subscriptions`,
		});
	}

	public readCacheItem(_cacheItem: IMetadataCacheItem, _propPath: PropPath): unknown {
		throw new MetaBindInternalError({
			errorLevel: ErrorLevel.CRITICAL,
			effect: 'action not permitted',
			cause: `source 'scope' should have no cache items or subscriptions`,
		});
	}

	public shouldDelete(_cacheItem: IMetadataCacheItem): boolean {
		throw new MetaBindInternalError({
			errorLevel: ErrorLevel.CRITICAL,
			effect: 'action not permitted',
			cause: `source 'scope' should have no cache items or subscriptions`,
		});
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

	public update(_value: unknown, _subscription: IMetadataSubscription): IMetadataCacheItem {
		throw new MetaBindInternalError({
			errorLevel: ErrorLevel.CRITICAL,
			effect: 'action not permitted',
			cause: `source 'scope' should have no cache items or subscriptions`,
		});
	}

	public updateEntireCache(_value: Metadata, _cacheItem: IMetadataCacheItem): void {
		throw new MetaBindInternalError({
			errorLevel: ErrorLevel.CRITICAL,
			effect: 'action not permitted',
			cause: `source 'scope' should have no cache items or subscriptions`,
		});
	}

	public readEntireCacheItem(_cacheItem: IMetadataCacheItem): Metadata {
		throw new MetaBindInternalError({
			errorLevel: ErrorLevel.CRITICAL,
			effect: 'action not permitted',
			cause: `source 'scope' should have no cache items or subscriptions`,
		});
	}
}

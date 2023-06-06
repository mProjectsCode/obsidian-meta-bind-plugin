import { MetadataFileCacheListener } from './MetadataManager';
import { MetaBindPublishPlugin } from '../Publish';
import { Signal } from '../utils/Signal';
import { traverseObjectByPath } from '@opd-libs/opd-utils-lib/lib/ObjectTraversalUtils';
import { arrayEquals, traverseObjectToParentByPath } from '../utils/Utils';
import { AbstractMetadataManager } from './AbstractMetadataManager';

export interface PublishMetadataFileCache {
	filePath: string;
	metadata: Record<string, any>;
	listeners: MetadataFileCacheListener[];
}

export class PublishMetadataManager extends AbstractMetadataManager<PublishMetadataFileCache> {
	cache: PublishMetadataFileCache[];
	plugin: MetaBindPublishPlugin;

	constructor(plugin: MetaBindPublishPlugin) {
		super();

		this.plugin = plugin;

		this.cache = [];
	}

	register(filePath: string, frontmatter: any, signal: Signal<any | undefined>, metadataPath: string[], uuid: string): PublishMetadataFileCache {
		const fileCache: PublishMetadataFileCache | undefined = this.getCacheForFile(filePath);
		if (fileCache) {
			console.debug(`meta-bind | MetadataManager >> registered ${uuid} to existing file cache ${filePath} -> ${metadataPath}`);
			fileCache.listeners.push({
				callback: (value: any) => signal.set(value),
				metadataPath: metadataPath,
				uuid: uuid,
			});
			signal.set(traverseObjectByPath(metadataPath, fileCache.metadata));
			return fileCache;
		} else {
			console.debug(`meta-bind | MetadataManager >> registered ${uuid} to newly created file cache ${filePath} -> ${metadataPath}`);
			const c: PublishMetadataFileCache = {
				filePath: filePath,
				metadata: frontmatter,
				listeners: [
					{
						callback: (value: any) => signal.set(value),
						metadataPath: metadataPath,
						uuid: uuid,
					},
				],
			};
			console.log(`meta-bind | MetadataManager >> loaded metadata for file ${filePath}`, c.metadata);
			signal.set(traverseObjectByPath(metadataPath, c.metadata));

			this.cache.push(c);
			return c;
		}
	}

	unregister(filePath: string, uuid: string): void {
		const fileCache = this.getCacheForFile(filePath);
		if (!fileCache) {
			return;
		}

		console.debug(`meta-bind | MetadataManager >> unregistered ${uuid} to from file cache ${filePath}`);

		fileCache.listeners = fileCache.listeners.filter(x => x.uuid !== uuid);
		if (fileCache.listeners.length === 0) {
			console.debug(`meta-bind | MetadataManager >> deleted unused file cache ${filePath}`);
			this.cache = this.cache.filter(x => x.filePath !== filePath);
		}
	}

	getCacheForFile(filePath: string): PublishMetadataFileCache | undefined {
		return this.cache.find(x => x.filePath === filePath);
	}

	updateCache(metadata: Record<string, any>, filePath: string, uuid?: string | undefined): void {
		console.debug(`meta-bind | MetadataManager >> updating metadata in ${filePath} metadata cache to`, metadata);

		const fileCache = this.getCacheForFile(filePath);
		if (!fileCache) {
			return;
		}

		fileCache.metadata = metadata;

		this.notifyListeners(fileCache, undefined, uuid);
	}

	updatePropertyInCache(value: any, pathParts: string[], filePath: string, uuid?: string | undefined): void {
		console.debug(`meta-bind | MetadataManager >> updating "${JSON.stringify(pathParts)}" in "${filePath}" metadata cache to`, value);
		// console.trace();

		const fileCache = this.getCacheForFile(filePath);
		if (!fileCache) {
			return;
		}

		const { parent, child } = traverseObjectToParentByPath(pathParts, fileCache.metadata);

		if (parent.value === undefined) {
			throw Error(`The parent of "${JSON.stringify(pathParts)}" does not exist in Object, please create the parent first`);
		}

		if (child.value === value) {
			console.debug(`meta-bind | MetadataManager >> skipping redundant update of "${JSON.stringify(pathParts)}" in "${filePath}" metadata cache`, value);
			return;
		}

		parent.value[child.key] = value;

		this.notifyListeners(fileCache, pathParts, uuid);
	}

	notifyListeners(fileCache: PublishMetadataFileCache, metadataPath?: string[] | undefined, exceptUuid?: string | undefined): void {
		let value;
		if (metadataPath) {
			value = traverseObjectByPath(metadataPath, fileCache.metadata);
		}

		// console.log(fileCache);

		for (const listener of fileCache.listeners) {
			if (exceptUuid && exceptUuid === listener.uuid) {
				continue;
			}

			if (metadataPath) {
				if (arrayEquals(metadataPath, listener.metadataPath)) {
					console.debug(`meta-bind | MetadataManager >> notifying input field ${listener.uuid} of updated metadata value`, value);
					listener.callback(value);
				}
			} else {
				const v = traverseObjectByPath(listener.metadataPath, fileCache.metadata);
				console.debug(`meta-bind | MetadataManager >> notifying input field ${listener.uuid} of updated metadata`, listener.metadataPath, fileCache.metadata, v);
				listener.callback(v);
			}
		}
	}
}

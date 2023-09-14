import { CachedMetadata, TFile } from 'obsidian';
import MetaBindPlugin from '../main';
import { arrayEquals, traverseObjectToParentByPath } from '../utils/Utils';
import { traverseObjectByPath } from '@opd-libs/opd-utils-lib/lib/ObjectTraversalUtils';
import { Signal } from '../utils/Signal';
import { MetadataFileCache } from './MetadataFileCache';

export const metadataCacheUpdateCycleThreshold = 5; // {syncInterval (200)} * 5 = 1s
export const metadataCacheInactiveCycleThreshold = 5 * 60; // {syncInterval (200)} * 5 * 60 = 1 minute

export class MetadataManager {
	cache: Map<string, MetadataFileCache>;
	plugin: MetaBindPlugin;
	interval: number | undefined;

	constructor(plugin: MetaBindPlugin) {
		this.plugin = plugin;

		this.cache = new Map<string, MetadataFileCache>();

		this.plugin.registerEvent(
			this.plugin.app.metadataCache.on('changed', (file, data, cache) => this.updateCacheOnFrontmatterUpdate(file.path, data, cache))
		);

		this.interval = window.setInterval(() => this.update(), this.plugin.settings.syncInterval);
	}

	register(filePath: string, signal: Signal<any | undefined>, metadataPath: string[], uuid: string): MetadataFileCache {
		const fileCache: MetadataFileCache | undefined = this.getCacheForFile(filePath);
		if (fileCache) {
			console.debug(`meta-bind | MetadataManager >> registered ${uuid} to existing file cache ${filePath} -> ${metadataPath}`);

			fileCache.inactive = false;
			fileCache.cyclesSinceInactive = 0;
			fileCache.listeners.push({
				callback: (value: any) => signal.set(value),
				metadataPath: metadataPath,
				uuid: uuid,
			});
			signal.set(traverseObjectByPath(metadataPath, fileCache.metadata));

			return fileCache;
		} else {
			console.debug(`meta-bind | MetadataManager >> registered ${uuid} to newly created file cache ${filePath} -> ${metadataPath}`);

			const file = this.plugin.app.vault.getAbstractFileByPath(filePath) as TFile;
			const frontmatter = this.plugin.app.metadataCache.getFileCache(file)?.frontmatter;

			const c: MetadataFileCache = {
				file: file,
				metadata: frontmatter ?? {},
				listeners: [
					{
						callback: (value: any) => signal.set(value),
						metadataPath: metadataPath,
						uuid: uuid,
					},
				],
				cyclesSinceLastChange: 0,
				cyclesSinceInactive: 0,
				inactive: false,
				changed: false,
			};
			console.log(`meta-bind | MetadataManager >> loaded metadata for file ${file.path}`, c.metadata);
			signal.set(traverseObjectByPath(metadataPath, c.metadata));

			this.cache.set(filePath, c);
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
			console.debug(`meta-bind | MetadataManager >> marked unused file cache as inactive ${filePath}`);
			fileCache.inactive = true;
		}
	}

	getCacheForFile(filePath: string): MetadataFileCache | undefined {
		return this.cache.get(filePath);
	}

	private update(): void {
		// console.debug('meta-bind | updating metadata manager');
		const markedForDelete: string[] = [];

		for (const [filePath, cacheEntry] of this.cache) {
			// if the entry changed, update the frontmatter of the note
			if (cacheEntry.changed) {
				this.updateFrontmatter(cacheEntry);
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

	async updateFrontmatter(fileCache: MetadataFileCache): Promise<void> {
		console.debug(`meta-bind | MetadataManager >> updating frontmatter of "${fileCache.file.path}" to`, fileCache.metadata);
		try {
			await this.plugin.app.fileManager.processFrontMatter(fileCache.file, frontMatter => {
				fileCache.changed = false;
				Object.assign(frontMatter, fileCache.metadata);
			});
		} catch (e) {
			fileCache.changed = false;
			console.warn('failed to update frontmatter', e);
		}
	}

	updateCache(metadata: Record<string, any>, filePath: string, uuid?: string | undefined): void {
		console.debug(`meta-bind | MetadataManager >> updating metadata in ${filePath} metadata cache to`, metadata);

		const fileCache = this.getCacheForFile(filePath);
		if (!fileCache) {
			return;
		}

		fileCache.metadata = metadata;
		fileCache.cyclesSinceLastChange = 0;
		fileCache.changed = true;

		this.notifyListeners(fileCache, undefined, uuid);
	}

	updatePropertyInCache(value: unknown, pathParts: string[], filePath: string, uuid?: string | undefined): void {
		console.debug(`meta-bind | MetadataManager >> updating "${JSON.stringify(pathParts)}" in "${filePath}" metadata cache to`, value);
		// console.trace();

		const fileCache = this.getCacheForFile(filePath);
		if (!fileCache) {
			return;
		}

		console.warn(pathParts, fileCache.metadata, filePath);
		const { parent, child } = traverseObjectToParentByPath(pathParts, fileCache.metadata);

		if (parent.value === undefined) {
			throw Error(`The parent of "${JSON.stringify(pathParts)}" does not exist in Object, please create the parent first`);
		}

		// disabled because of mutated data in the cache
		// if (deepEquals(child.value, value)) {
		// 	console.debug(`meta-bind | MetadataManager >> skipping redundant update of "${JSON.stringify(pathParts)}" in "${filePath}" metadata cache`, value);
		// 	return;
		// }

		parent.value[child.key] = value;
		fileCache.cyclesSinceLastChange = 0;
		fileCache.changed = true;

		this.notifyListeners(fileCache, pathParts, uuid);
	}

	updateCacheOnFrontmatterUpdate(filePath: string, data: string, cache: CachedMetadata): void {
		const fileCache = this.getCacheForFile(filePath);
		if (!fileCache) {
			return;
		}

		// don't update if the user recently changed the cache
		if (fileCache.cyclesSinceLastChange < metadataCacheUpdateCycleThreshold) {
			return;
		}

		const metadata: Record<string, any> = Object.assign({}, cache.frontmatter); // copy
		delete metadata.position;

		console.debug(`meta-bind | MetadataManager >> updating "${filePath}" on frontmatter update`, metadata);

		fileCache.metadata = metadata;

		this.notifyListeners(fileCache);
	}

	notifyListeners(fileCache: MetadataFileCache, metadataPath?: string[] | undefined, exceptUuid?: string | undefined): void {
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
				console.debug(
					`meta-bind | MetadataManager >> notifying input field ${listener.uuid} of updated metadata`,
					listener.metadataPath,
					fileCache.metadata,
					v
				);
				listener.callback(v);
			}
		}
	}
}

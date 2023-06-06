import { CachedMetadata, TFile } from 'obsidian';
import MetaBindPlugin from '../main';
import { Internal } from '@opd-libs/opd-metadata-lib/lib/Internal';
import { arrayEquals, traverseObjectToParentByPath } from '../utils/Utils';
import { traverseObjectByPath } from '@opd-libs/opd-utils-lib/lib/ObjectTraversalUtils';
import { Signal } from '../utils/Signal';
import getMetadataFromFileCache = Internal.getMetadataFromFileCache;
import { MetadataFileCache } from './MetadataFileCache';

export class MetadataManager {
	cache: MetadataFileCache[];
	plugin: MetaBindPlugin;
	updateCycleThreshold = 5;
	interval: number | undefined;

	constructor(plugin: MetaBindPlugin) {
		this.plugin = plugin;

		this.cache = [];

		this.plugin.registerEvent(this.plugin.app.metadataCache.on('changed', (file, data, cache) => this.updateCacheOnFrontmatterUpdate(file.path, data, cache)));

		this.interval = window.setInterval(() => this.update(), this.plugin.settings.syncInterval);
	}

	register(filePath: string, frontmatter: any | null | undefined, signal: Signal<any | undefined>, metadataPath: string[], uuid: string): MetadataFileCache {
		const fileCache: MetadataFileCache | undefined = this.getCacheForFile(filePath);
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
			const file = this.plugin.app.vault.getAbstractFileByPath(filePath) as TFile;
			const c: MetadataFileCache = {
				file: file,
				metadata: getMetadataFromFileCache(file, this.plugin),
				listeners: [
					{
						callback: (value: any) => signal.set(value),
						metadataPath: metadataPath,
						uuid: uuid,
					},
				],
				cyclesSinceLastUserInput: 0,
				changed: false,
			};
			console.log(`meta-bind | MetadataManager >> loaded metadata for file ${file.path}`, c.metadata);
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
			this.cache = this.cache.filter(x => x.file.path !== filePath);
		}
	}

	getCacheForFile(filePath: string): MetadataFileCache | undefined {
		return this.cache.find(x => x.file.path === filePath);
	}

	private update(): void {
		// console.debug('meta-bind | updating metadata manager');

		for (const entry of this.cache) {
			if (entry.changed) {
				this.updateFrontmatter(entry);
			}
			entry.cyclesSinceLastUserInput += 1;
		}
	}

	async updateFrontmatter(fileCache: MetadataFileCache): Promise<void> {
		console.debug(`meta-bind | MetadataManager >> updating frontmatter of "${fileCache.file.path}" to`, fileCache.metadata);
		await this.plugin.app.fileManager.processFrontMatter(fileCache.file, frontMatter => {
			fileCache.changed = false;
			Object.assign(frontMatter, fileCache.metadata);
		});
	}

	updateCache(metadata: Record<string, any>, filePath: string, uuid?: string | undefined): void {
		console.debug(`meta-bind | MetadataManager >> updating metadata in ${filePath} metadata cache to`, metadata);

		const fileCache = this.getCacheForFile(filePath);
		if (!fileCache) {
			return;
		}

		fileCache.metadata = metadata;
		fileCache.cyclesSinceLastUserInput = 0;

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
		fileCache.cyclesSinceLastUserInput = 0;
		fileCache.changed = true;

		this.notifyListeners(fileCache, pathParts, uuid);
	}

	updateCacheOnFrontmatterUpdate(filePath: string, data: string, cache: CachedMetadata): void {
		const fileCache = this.getCacheForFile(filePath);
		if (!fileCache) {
			return;
		}

		// don't update if the user recently changed the cache
		if (fileCache.cyclesSinceLastUserInput < this.updateCycleThreshold) {
			return;
		}

		const metadata: Record<string, any> = Object.assign({}, cache.frontmatter); // copy
		delete metadata.position;

		console.debug(`meta-bind | MetadataManager >> updating "${filePath}" on frontmatter update`, metadata);

		fileCache.metadata = metadata;
		fileCache.cyclesSinceLastUserInput = 0;
		// fileCache.changed = true;

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
				console.debug(`meta-bind | MetadataManager >> notifying input field ${listener.uuid} of updated metadata`, listener.metadataPath, fileCache.metadata, v);
				listener.callback(v);
			}
		}
	}
}

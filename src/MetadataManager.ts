import { CachedMetadata, TFile } from 'obsidian';
import MetaBindPlugin from './main';
import { setFrontmatterOfTFile } from '@opd-libs/opd-metadata-lib/lib/API';
import { traverseObjectToParent } from '@opd-libs/opd-metadata-lib/lib/Utils';
import { Internal } from '@opd-libs/opd-metadata-lib/lib/Internal';
import getMetaDataFromFileContent = Internal.getMetaDataFromFileContent;

export interface MetadataFileCache {
	file: TFile;
	metadata: Record<string, any>;
	listeners: {
		onCacheUpdate: (metadata: Record<string, any>) => void;
		uuid: string;
	}[];
	cyclesSinceLastUpdate: number;
	changed: boolean;
}

export class MetadataManager {
	cache: MetadataFileCache[];
	plugin: MetaBindPlugin;
	updateCycleThreshold = 5;
	interval: number | undefined;

	constructor(plugin: MetaBindPlugin) {
		this.plugin = plugin;

		this.cache = [];

		this.plugin.registerEvent(this.plugin.app.metadataCache.on('changed', this.updateMetadataFileCacheOnFrontmatterUpdate.bind(this)));

		this.interval = window.setInterval(() => this.update(), this.plugin.settings.syncInterval);
	}

	register(file: TFile, onCacheUpdate: (metadata: Record<string, any>) => void, uuid: string): MetadataFileCache {
		const fileCache = this.getCacheForFile(file);
		if (fileCache) {
			console.debug(`meta-bind | MetadataManager >> registered ${uuid} to existing file cache ${file.path}`);
			fileCache.listeners.push({ onCacheUpdate, uuid });
			return fileCache;
		} else {
			console.debug(`meta-bind | MetadataManager >> registered ${uuid} to newly created file cache ${file.path}`);
			const c: MetadataFileCache = {
				file: file,
				metadata: {},
				listeners: [{ onCacheUpdate, uuid }],
				cyclesSinceLastUpdate: 0,
				changed: false,
			};

			this.plugin.app.vault.cachedRead(file).then(value => {
				c.metadata = getMetaDataFromFileContent(value);
				this.notifyListeners(c);
			});

			this.cache.push(c);
			return c;
		}
	}

	unregister(file: TFile, uuid: string): void {
		const fileCache = this.getCacheForFile(file);
		if (!fileCache) {
			return;
		}

		console.debug(`meta-bind | MetadataManager >> unregistered ${uuid} to from file cache ${file.path}`);

		fileCache.listeners = fileCache.listeners.filter(x => x.uuid !== uuid);
		if (fileCache.listeners.length === 0) {
			console.debug(`meta-bind | MetadataManager >> deleted unused file cache ${file.path}`);
			this.cache = this.cache.filter(x => x.file.path !== file.path);
		}
	}

	getCacheForFile(file: TFile): MetadataFileCache | undefined {
		return this.cache.find(x => x.file.path === file.path);
	}

	private update(): void {
		// console.debug('meta-bind | updating metadata manager');

		for (const metadataFileCache of this.cache) {
			if (metadataFileCache.changed) {
				this.updateFrontmatter(metadataFileCache);
			}
			metadataFileCache.cyclesSinceLastUpdate += 1;
		}
	}

	async updateFrontmatter(fileCache: MetadataFileCache): Promise<void> {
		console.debug(`meta-bind | MetadataManager >> updating frontmatter of ${fileCache.file.path} to`, fileCache.metadata);

		fileCache.changed = false;
		await setFrontmatterOfTFile(fileCache.metadata, fileCache.file, this.plugin);
	}

	updateMetadataFileCache(metadata: Record<string, any>, file: TFile, uuid?: string | undefined): void {
		console.debug(`meta-bind | MetadataManager >> updating metadata in ${file.path} metadata cache to`, metadata);

		const fileCache = this.getCacheForFile(file);
		if (!fileCache) {
			return;
		}

		fileCache.metadata = metadata;
		fileCache.cyclesSinceLastUpdate = 0;

		this.notifyListeners(fileCache, uuid);
	}

	updatePropertyInMetadataFileCache(value: any, path: string, file: TFile, uuid?: string | undefined): void {
		console.debug(`meta-bind | MetadataManager >> updating ${path} in ${file.path} metadata cache to`, value);

		const fileCache = this.getCacheForFile(file);
		if (!fileCache) {
			return;
		}

		const { parent, child } = traverseObjectToParent(path, fileCache.metadata);

		if (parent.value === undefined) {
			throw Error(`The parent of "${path}" does not exist in Object, please create the parent first`);
		}

		parent.value[child.key] = value;
		fileCache.cyclesSinceLastUpdate = 0;
		fileCache.changed = true;

		this.notifyListeners(fileCache, uuid);
	}

	updateMetadataFileCacheOnFrontmatterUpdate(file: TFile, data: string, cache: CachedMetadata): void {
		const fileCache = this.getCacheForFile(file);
		if (!fileCache) {
			return;
		}

		if (fileCache.cyclesSinceLastUpdate < this.updateCycleThreshold) {
			return;
		}

		const metadata: Record<string, any> = Object.assign({}, cache.frontmatter); // copy
		delete metadata.position;

		console.debug(`meta-bind | MetadataManager >> updating ${file} on frontmatter update`, metadata);

		fileCache.metadata = metadata;
		fileCache.cyclesSinceLastUpdate = 0;
		fileCache.changed = true;

		this.notifyListeners(fileCache);
	}

	notifyListeners(fileCache: MetadataFileCache, exceptUuid?: string | undefined): void {
		for (const listener of fileCache.listeners) {
			if (exceptUuid && exceptUuid === listener.uuid) {
				continue;
			}
			console.debug(`meta-bind | MetadataManager >> notifying input field ${listener.uuid} of updated metadata`);
			listener.onCacheUpdate(fileCache.metadata);
		}
	}
}

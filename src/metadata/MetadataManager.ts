import { CachedMetadata, TFile } from 'obsidian';
import MetaBindPlugin from '../main';
import { areArraysEqual, arrayStartsWith, traverseObjectToParentByPath } from '../utils/Utils';
import { traverseObjectByPath } from '@opd-libs/opd-utils-lib/lib/ObjectTraversalUtils';
import { Signal } from '../utils/Signal';
import {
	ComputedMetadataSubscription,
	ComputedSubscriptionDependency,
	ComputeFunction,
	IMetadataSubscription,
	MetadataFileCache,
	MetadataSubscription,
} from './MetadataFileCache';
import { FullBindTarget } from '../parsers/inputFieldParser/InputFieldDeclaration';
import { ErrorLevel, MetaBindBindTargetError, MetaBindInternalError } from '../utils/errors/MetaBindErrors';

export const metadataCacheUpdateCycleThreshold = 5; // {syncInterval (200)} * 5 = 1s
export const metadataCacheInactiveCycleThreshold = 5 * 60; // {syncInterval (200)} * 5 * 60 = 1 minute

/**
 * Checks if bind target `b` should receive an update when bind target `a` changes.
 *
 * @param a
 * @param b
 */
function hasUpdateOverlap(a: FullBindTarget | undefined, b: FullBindTarget | undefined): boolean {
	if (a === undefined || b === undefined) {
		return false;
	}

	if (a.filePath !== b.filePath) {
		return false;
	}

	return metadataPathHasUpdateOverlap(a.metadataPath, b.metadataPath, b.listenToChildren);
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
 */
function metadataPathHasUpdateOverlap(a: string[], b: string[], listenToChildren: boolean): boolean {
	if (areArraysEqual(a, b)) {
		return true;
	}

	if (arrayStartsWith(b, a)) {
		return true;
	}

	if (listenToChildren && arrayStartsWith(a, b)) {
		return true;
	}

	return false;
}

function bindTargetToString(a: FullBindTarget | undefined): string {
	if (a === undefined) {
		return 'undefined';
	}

	return `${a.filePath}#${a.metadataPath}`;
}

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

	private subscribeSubscription(subscription: IMetadataSubscription): void {
		if (subscription.bindTarget === undefined) {
			return;
		}

		const fileCache: MetadataFileCache | undefined = this.getCacheForFile(subscription.bindTarget.filePath);

		if (fileCache) {
			console.debug(
				`meta-bind | MetadataManager >> registered ${subscription.uuid} to existing file cache ${subscription.bindTarget.filePath} -> ${subscription.bindTarget.metadataPath}`
			);

			fileCache.inactive = false;
			fileCache.cyclesSinceInactive = 0;
			fileCache.listeners.push(subscription);

			subscription.notify(traverseObjectByPath(subscription.bindTarget.metadataPath, fileCache.metadata));
		} else {
			console.debug(
				`meta-bind | MetadataManager >> registered ${subscription.uuid} to newly created file cache ${subscription.bindTarget.filePath} -> ${subscription.bindTarget.metadataPath}`
			);

			const file = this.plugin.app.vault.getAbstractFileByPath(subscription.bindTarget.filePath) as TFile;
			const frontmatter = this.plugin.app.metadataCache.getFileCache(file)?.frontmatter;

			const newCache: MetadataFileCache = {
				file: file,
				metadata: frontmatter ?? {},
				listeners: [subscription],
				cyclesSinceLastChange: 0,
				cyclesSinceInactive: 0,
				inactive: false,
				changed: false,
			};
			console.log(`meta-bind | MetadataManager >> loaded metadata for file ${file.path}`, newCache.metadata);

			subscription.notify(traverseObjectByPath(subscription.bindTarget.metadataPath, newCache.metadata));

			this.createCacheForFile(subscription.bindTarget.filePath, newCache);
		}
	}

	subscribe(uuid: string, callbackSignal: Signal<any>, bindTarget: FullBindTarget): MetadataSubscription {
		const subscription: MetadataSubscription = new MetadataSubscription(uuid, callbackSignal, this, bindTarget);

		this.subscribeSubscription(subscription);

		return subscription;
	}

	subscribeComputed(
		uuid: string,
		callbackSignal: Signal<any>,
		bindTarget: FullBindTarget | undefined,
		dependencies: ComputedSubscriptionDependency[],
		computeFunction: ComputeFunction
	): ComputedMetadataSubscription {
		const subscription: ComputedMetadataSubscription = new ComputedMetadataSubscription(
			uuid,
			callbackSignal,
			this,
			bindTarget,
			dependencies,
			computeFunction
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

	private recCheckForLoops(dependencyPath: IMetadataSubscription[]): void {
		// console.warn('checking for loops', dependencyPath.map(x => `"${bindTargetsToString(x.bindTarget)}"`).join(' -> '));

		const firstDependency = dependencyPath.first();
		const lastDependency = dependencyPath.last();
		if (lastDependency === undefined || firstDependency === undefined) {
			return;
		}

		if (hasUpdateOverlap(firstDependency.bindTarget, lastDependency.bindTarget)) {
			throw new MetaBindBindTargetError(
				ErrorLevel.ERROR,
				'bind target dependency loop detected',
				`the loop is as follows: ${dependencyPath.map(x => `"${bindTargetToString(x.bindTarget)}"`).join(' -> ')}`
			);
		}

		// console.warn('next step dependencies', this.getAllSubscriptionsToDependencies(lastDependency));
		// i need to get all listeners that point to the same bind target for each dependency
		for (const dependency of this.getAllSubscriptionsToDependencies(lastDependency)) {
			this.recCheckForLoops([...dependencyPath, dependency]);
		}
	}

	private getAllSubscriptionsToDependencies(subscription: IMetadataSubscription): IMetadataSubscription[] {
		return subscription
			.getDependencies()
			.map(x => this.getAllSubscriptionsToBindTarget(x.bindTarget))
			.flat();
	}

	private getAllSubscriptionsToBindTarget(bindTarget: FullBindTarget | undefined): IMetadataSubscription[] {
		if (bindTarget === undefined) {
			return [];
		}

		const fileCache = this.getCacheForFile(bindTarget.filePath);
		if (!fileCache) {
			return [];
		}

		const ret = [];
		for (const subscription of fileCache.listeners) {
			if (hasUpdateOverlap(subscription.bindTarget, bindTarget)) {
				ret.push(subscription);
			}
		}

		return fileCache.listeners.filter(x => hasUpdateOverlap(x.bindTarget, bindTarget));
	}

	unsubscribe(subscription: IMetadataSubscription): void {
		if (subscription.bindTarget === undefined) {
			return;
		}

		const filePath = subscription.bindTarget.filePath;

		const fileCache = this.getCacheForFile(filePath);
		if (!fileCache) {
			return;
		}

		console.debug(`meta-bind | MetadataManager >> unregistered ${subscription.uuid} to from file cache ${filePath}`);

		fileCache.listeners = fileCache.listeners.filter(x => x.uuid !== subscription.uuid);
		if (fileCache.listeners.length === 0) {
			console.debug(`meta-bind | MetadataManager >> marked unused file cache as inactive ${filePath}`);
			fileCache.inactive = true;
		}
	}

	getCacheForFile(filePath: string): MetadataFileCache | undefined {
		return this.cache.get(filePath);
	}

	createCacheForFile(filePath: string, cache: MetadataFileCache): void {
		if (this.cache.has(filePath)) {
			throw new MetaBindInternalError(ErrorLevel.CRITICAL, 'can not create metadata file cache', 'cache for file already exists');
		}
		this.cache.set(filePath, cache);
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

	updateCache(value: unknown, subscription: IMetadataSubscription): void {
		if (subscription.bindTarget === undefined) {
			return;
		}

		const metadataPath = subscription.bindTarget.metadataPath;
		const filePath = subscription.bindTarget.filePath;

		console.debug(`meta-bind | MetadataManager >> updating "${JSON.stringify(metadataPath)}" in "${filePath}" metadata cache to`, value);

		const fileCache = this.getCacheForFile(filePath);
		if (!fileCache) {
			return;
		}

		const { parent, child } = traverseObjectToParentByPath(metadataPath, fileCache.metadata);

		if (parent.value === undefined) {
			throw Error(`The parent of "${JSON.stringify(metadataPath)}" does not exist in Object, please create the parent first`);
		}

		parent.value[child.key] = value;
		fileCache.cyclesSinceLastChange = 0;
		fileCache.changed = true;

		this.notifyListeners(fileCache, metadataPath, subscription.uuid);
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
		// console.log(fileCache);

		for (const listener of fileCache.listeners) {
			if (exceptUuid && exceptUuid === listener.uuid) {
				continue;
			}

			if (listener.bindTarget === undefined) {
				continue;
			}

			if (metadataPath) {
				if (metadataPathHasUpdateOverlap(metadataPath, listener.bindTarget.metadataPath, listener.bindTarget.listenToChildren)) {
					const value = traverseObjectByPath(listener.bindTarget.metadataPath, fileCache.metadata);
					console.debug(`meta-bind | MetadataManager >> notifying input field ${listener.uuid} of updated metadata value`, value);
					listener.notify(value);
				}

				// if (listener.bindTarget.listenToChildren) {
				// 	// TODO: this should update when there is any overlap in the beginning of the array
				// 	if (arrayStartsWith(metadataPath, listener.bindTarget.metadataPath)) {
				// 		const actualValue = traverseObjectByPath(listener.bindTarget.metadataPath, fileCache.metadata);
				// 		console.debug(`meta-bind | MetadataManager >> notifying input field ${listener.uuid} of updated metadata value`, actualValue);
				// 		listener.notify(actualValue);
				// 	}
				// } else {
				// 	if (arrayStartsWith(listener.bindTarget.metadataPath, metadataPath)) {
				// 		const actualValue = traverseObjectByPath(listener.bindTarget.metadataPath, fileCache.metadata);
				// 		console.debug(`meta-bind | MetadataManager >> notifying input field ${listener.uuid} of updated metadata value`, actualValue);
				// 		listener.notify(actualValue);
				// 	}
				// }
			} else {
				const v = traverseObjectByPath(listener.bindTarget.metadataPath, fileCache.metadata);
				console.debug(
					`meta-bind | MetadataManager >> notifying input field ${listener.uuid} of updated metadata`,
					listener.bindTarget.metadataPath,
					fileCache.metadata,
					v
				);
				listener.notify(v);
			}
		}
	}
}

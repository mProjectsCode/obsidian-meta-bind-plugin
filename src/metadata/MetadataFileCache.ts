import { Signal } from '../utils/Signal';
import { FrontMatterCache, TFile } from 'obsidian';
import { FullBindTarget } from '../parsers/inputFieldParser/InputFieldDeclaration';
import { MetadataManager } from './MetadataManager';

export interface IMetadataSubscription {
	uuid: string;
	bindTarget: FullBindTarget | undefined;
	unsubscribe: () => void;
	notify: (value: any) => void;
	getDependencies: () => ComputedSubscriptionDependency[];
}

export class MetadataSubscription implements IMetadataSubscription {
	readonly uuid: string;
	readonly callbackSignal: Signal<any>;

	readonly metadataManager: MetadataManager;

	readonly bindTarget: FullBindTarget;

	constructor(uuid: string, callbackSignal: Signal<any>, metadataManager: MetadataManager, bindTarget: FullBindTarget) {
		this.uuid = uuid;
		this.callbackSignal = callbackSignal;
		this.metadataManager = metadataManager;
		this.bindTarget = bindTarget;
	}

	/**
	 * Unsubscribes from the cache.
	 */
	public unsubscribe(): void {
		this.metadataManager.unsubscribe(this);
	}

	/**
	 * Updates the cache.
	 *
	 * @param value
	 */
	public update(value: any): void {
		this.metadataManager.updateCache(value, this);
	}

	/**
	 * DO NOT CALL!
	 *
	 * Notifies the subscription of an updated value in the cache.
	 *
	 * @param value
	 */
	public notify(value: any): void {
		this.callbackSignal.set(value);
	}

	public getDependencies(): ComputedSubscriptionDependency[] {
		return [];
	}
}

export type ComputeFunction = (values: any[]) => Promise<any> | any;

export interface ComputedSubscriptionDependency {
	bindTarget: FullBindTarget;
	callbackSignal: Signal<any>;
}

export class ComputedMetadataSubscription implements IMetadataSubscription {
	readonly uuid: string;
	readonly callbackSignal: Signal<any>;

	readonly metadataManager: MetadataManager;

	readonly bindTarget: FullBindTarget | undefined;
	readonly dependencies: ComputedSubscriptionDependency[];

	readonly dependencySubscriptions: MetadataSubscription[];

	readonly computeFunction: ComputeFunction;

	constructor(
		uuid: string,
		callbackSignal: Signal<any>,
		metadataManager: MetadataManager,
		bindTarget: FullBindTarget | undefined,
		dependencies: ComputedSubscriptionDependency[],
		computeFunction: ComputeFunction
	) {
		this.uuid = uuid;
		this.callbackSignal = callbackSignal;
		this.metadataManager = metadataManager;
		this.bindTarget = bindTarget;
		this.dependencies = dependencies;
		this.dependencySubscriptions = [];
		this.computeFunction = computeFunction;
	}

	/**
	 * DO NOT CALL!
	 *
	 * Used to initialize the dependency subscriptions.
	 */
	public init(): void {
		for (const dependency of this.dependencies) {
			const dependencyId = this.uuid + '/' + self.crypto.randomUUID();

			this.dependencySubscriptions.push(this.metadataManager.subscribe(dependencyId, dependency.callbackSignal, dependency.bindTarget));

			dependency.callbackSignal.registerListener({ callback: () => this.computeValue() });
		}

		this.computeValue();
	}

	private async computeValue(): Promise<void> {
		const values = this.dependencySubscriptions.map(x => x.callbackSignal.get());
		const value = await this.computeFunction(values);
		this.callbackSignal.set(value);
		this.metadataManager.updateCache(value, this);
	}

	/**
	 * Unsubscribes from the cache.
	 */
	public unsubscribe(): void {
		for (const dependencySubscription of this.dependencySubscriptions) {
			dependencySubscription.unsubscribe();
		}

		this.metadataManager.unsubscribe(this);
	}

	/**
	 * Does nothing.
	 *
	 * @param value
	 */
	public notify(value: any): void {}

	public getDependencies(): ComputedSubscriptionDependency[] {
		return this.dependencies;
	}
}

export interface MetadataFileCache {
	file: TFile;
	metadata: FrontMatterCache;
	listeners: IMetadataSubscription[];
	/**
	 * The cycles since the last change to the cache by the plugin.
	 */
	cyclesSinceLastChange: number;
	/**
	 * Whether the cache was changed by th plugin. If this is true, the frotmatter should be updated.
	 */
	changed: boolean;
	/**
	 * The cycles that the cache has been inactive, meaning no listener registered to it.
	 */
	cyclesSinceInactive: number;
	/**
	 * Whether the there are no subscribers to the cache.
	 */
	inactive: boolean;
}

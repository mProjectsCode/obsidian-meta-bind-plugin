// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
import { type FullBindTarget } from '../parsers/inputFieldParser/InputFieldDeclaration';
import { type Signal } from '../utils/Signal';
import { type IMetadataSubscription } from './IMetadataSubscription';
import { type MetadataManager } from './MetadataManager';
import { type MetadataSubscription } from './MetadataSubscription';
import { getUUID } from '../utils/Utils';

// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export type ComputeFunction = (values: unknown[]) => Promise<unknown> | unknown;

export interface ComputedSubscriptionDependency {
	bindTarget: FullBindTarget;
	callbackSignal: Signal<unknown>;
}

export class ComputedMetadataSubscription implements IMetadataSubscription {
	readonly uuid: string;
	readonly callbackSignal: Signal<unknown>;

	readonly metadataManager: MetadataManager;

	readonly bindTarget: FullBindTarget | undefined;
	readonly dependencies: ComputedSubscriptionDependency[];

	readonly dependencySubscriptions: MetadataSubscription[];

	readonly computeFunction: ComputeFunction;

	constructor(
		uuid: string,
		callbackSignal: Signal<unknown>,
		metadataManager: MetadataManager,
		bindTarget: FullBindTarget | undefined,
		dependencies: ComputedSubscriptionDependency[],
		computeFunction: ComputeFunction,
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
			const dependencyId = this.uuid + '/' + getUUID();

			this.dependencySubscriptions.push(this.metadataManager.subscribe(dependencyId, dependency.callbackSignal, dependency.bindTarget));

			dependency.callbackSignal.registerListener({ callback: () => void this.computeValue() });
		}

		void this.computeValue();
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
	 * @param _
	 */
	public notify(_: unknown): void {}

	public getDependencies(): ComputedSubscriptionDependency[] {
		return this.dependencies;
	}
}

// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
import type { IMetadataSubscription } from 'packages/core/src/metadata/IMetadataSubscription';
import type { MetadataManager } from 'packages/core/src/metadata/MetadataManager';
import type { MetadataSubscription } from 'packages/core/src/metadata/MetadataSubscription';
import type { BindTargetDeclaration } from 'packages/core/src/parsers/bindTargetParser/BindTargetDeclaration';
import type { Signal } from 'packages/core/src/utils/Signal';
import { getUUID } from 'packages/core/src/utils/Utils';
import { ErrorLevel, MetaBindInternalError } from 'packages/core/src/utils/errors/MetaBindErrors';

// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export type ComputeFunction = (values: unknown[]) => Promise<unknown> | unknown;

export interface ComputedSubscriptionDependency {
	bindTarget: BindTargetDeclaration;
	callbackSignal: Signal<unknown>;
}

export class ComputedMetadataSubscription implements IMetadataSubscription {
	readonly uuid: string;
	readonly callbackSignal: Signal<unknown>;

	readonly metadataManager: MetadataManager;

	readonly bindTarget: BindTargetDeclaration | undefined;
	readonly dependencies: ComputedSubscriptionDependency[];

	readonly dependencySubscriptions: MetadataSubscription[];

	readonly computeFunction: ComputeFunction;

	deleted: boolean;
	readonly onDelete: () => void;

	constructor(
		uuid: string,
		callbackSignal: Signal<unknown>,
		metadataManager: MetadataManager,
		bindTarget: BindTargetDeclaration | undefined,
		dependencies: ComputedSubscriptionDependency[],
		computeFunction: ComputeFunction,
		onDelete: () => void,
	) {
		this.uuid = uuid;
		this.callbackSignal = callbackSignal;
		this.metadataManager = metadataManager;
		this.bindTarget = bindTarget;
		this.dependencies = dependencies;
		this.dependencySubscriptions = [];
		this.computeFunction = computeFunction;
		this.onDelete = onDelete;

		this.deleted = false;
	}

	/**
	 * DO NOT CALL!
	 *
	 * Used to initialize the dependency subscriptions.
	 */
	public init(): void {
		for (const dependency of this.dependencies) {
			const dependencyId = this.uuid + '/' + getUUID();

			this.dependencySubscriptions.push(
				this.metadataManager.subscribe(dependencyId, dependency.callbackSignal, dependency.bindTarget, () =>
					this.delete(),
				),
			);

			dependency.callbackSignal.registerListener({ callback: () => void this.computeValue() });
		}

		void this.computeValue();
	}

	private async computeValue(): Promise<void> {
		try {
			const values = this.dependencySubscriptions.map(x => x.callbackSignal.get());
			const value = await this.computeFunction(values);
			this.callbackSignal.set(value);
			if (this.bindTarget !== undefined) {
				this.metadataManager.write(value, this.bindTarget, this.uuid);
			}
		} catch (e) {
			const error = e instanceof Error ? e : String(e);

			console.warn(
				new MetaBindInternalError({
					errorLevel: ErrorLevel.ERROR,
					effect: 'Failed to compute value of computed subscription',
					cause: error,
				}),
			);
		}
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

	/**
	 * DO NOT CALL!
	 *
	 * Called by the metadata manager when it wants to delete the subscription.
	 */
	public delete(): void {
		this.deleted = true;
		for (const dependencySubscription of this.dependencySubscriptions) {
			if (!dependencySubscription.deleted) {
				dependencySubscription.delete();
			}
		}

		this.onDelete();
		this.unsubscribe();
	}
}

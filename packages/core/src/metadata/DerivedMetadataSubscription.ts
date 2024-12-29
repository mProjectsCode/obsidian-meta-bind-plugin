import { zip } from 'itertools-ts/es/multi';
import type { IMetadataSubscription } from 'packages/core/src/metadata/IMetadataSubscription';
import type { MetadataManager } from 'packages/core/src/metadata/MetadataManager';
import type { MetadataSubscription } from 'packages/core/src/metadata/MetadataSubscription';
import type { BindTargetDeclaration } from 'packages/core/src/parsers/bindTargetParser/BindTargetDeclaration';
import { ErrorLevel, MetaBindInternalError } from 'packages/core/src/utils/errors/MetaBindErrors';
import type { Signal } from 'packages/core/src/utils/Signal';
import { getUUID } from 'packages/core/src/utils/Utils';

// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export type DeriveFunction = () => Promise<unknown> | unknown;

export class DerivedMetadataSubscription implements IMetadataSubscription {
	readonly uuid: string;

	readonly metadataManager: MetadataManager;

	readonly bindTarget: BindTargetDeclaration | undefined;
	readonly dependencies: BindTargetDeclaration[];
	readonly dependencySignals: Signal<unknown>[];

	readonly dependencySubscriptions: MetadataSubscription[];

	/**
	 * Computes the value of the subscription on every update of one of the dependencies.
	 * It is assumed that the compute function has the dependency signals in scope and can access them.
	 * The return value of the compute function is written to the cache.
	 */
	readonly computeFunction: DeriveFunction;

	deleted: boolean;
	readonly onDelete: () => void;

	constructor(
		uuid: string,
		metadataManager: MetadataManager,
		bindTarget: BindTargetDeclaration | undefined,
		dependencies: BindTargetDeclaration[],
		dependencySignals: Signal<unknown>[],
		computeFunction: DeriveFunction,
		onDelete: () => void,
	) {
		this.uuid = uuid;
		this.metadataManager = metadataManager;
		this.bindTarget = bindTarget;
		this.dependencies = dependencies;
		this.dependencySignals = dependencySignals;
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
		for (const [dependency, signal] of zip(this.dependencies, this.dependencySignals)) {
			const dependencyId = this.uuid + '/' + getUUID();

			this.dependencySubscriptions.push(
				this.metadataManager.subscribe(dependencyId, signal, dependency, () => this.delete()),
			);

			signal.registerListener({ callback: () => void this.computeValue() });
		}

		void this.computeValue();
	}

	/**
	 * Computes the value of the subscription and writes it to the cache.
	 * This uses the compute function and handles any errors that might occur.
	 */
	private async computeValue(): Promise<void> {
		try {
			const value = await this.computeFunction();
			if (this.bindTarget) {
				this.metadataManager.write(value, this.bindTarget, this.uuid);
			}
		} catch (e) {
			const error = e instanceof Error ? e : String(e);

			console.warn(
				new MetaBindInternalError({
					errorLevel: ErrorLevel.ERROR,
					effect: 'Failed to run derived metadata computation',
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
	 * Does nothing because this subscription only writes to the subscribed bind target.
	 * We don't care about other changes to the value of the bind target.
	 *
	 * @param _
	 */
	public onUpdate(_: unknown): void {}

	public getDependencies(): BindTargetDeclaration[] {
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

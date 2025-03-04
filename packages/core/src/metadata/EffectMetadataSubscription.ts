import { zip } from 'itertools-ts/es/multi';
import type { IMetadataSubscription } from 'packages/core/src/metadata/IMetadataSubscription';
import type { MetadataManager } from 'packages/core/src/metadata/MetadataManager';
import type { MetadataSubscription } from 'packages/core/src/metadata/MetadataSubscription';
import type { BindTargetDeclaration } from 'packages/core/src/parsers/bindTargetParser/BindTargetDeclaration';
import { ErrorLevel, MetaBindInternalError } from 'packages/core/src/utils/errors/MetaBindErrors';
import type { Signal } from 'packages/core/src/utils/Signal';
import { getUUID } from 'packages/core/src/utils/Utils';

export type EffectFunction = () => Promise<void> | void;

export class EffectMetadataSubscription implements IMetadataSubscription {
	readonly uuid: string;

	readonly metadataManager: MetadataManager;

	readonly bindTarget: BindTargetDeclaration | undefined;
	readonly dependencies: BindTargetDeclaration[];
	readonly dependencySignals: Signal<unknown>[];

	readonly dependencySubscriptions: MetadataSubscription[];

	readonly effectFunction: EffectFunction;

	deleted: boolean;
	readonly onDelete: () => void;

	constructor(
		uuid: string,
		metadataManager: MetadataManager,
		dependencies: BindTargetDeclaration[],
		dependencySignals: Signal<unknown>[],
		effectFunction: EffectFunction,
		onDelete: () => void,
	) {
		this.uuid = uuid;
		this.metadataManager = metadataManager;
		this.bindTarget = undefined;
		this.dependencies = dependencies;
		this.dependencySignals = dependencySignals;
		this.dependencySubscriptions = [];
		this.effectFunction = effectFunction;
		this.deleted = false;
		this.onDelete = onDelete;
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

			signal.registerListener({ callback: () => void this.runEffect() });
		}

		void this.runEffect();
	}

	private async runEffect(): Promise<void> {
		try {
			await this.effectFunction();
		} catch (e) {
			const error = e instanceof Error ? e : String(e);

			console.warn(
				new MetaBindInternalError({
					errorLevel: ErrorLevel.ERROR,
					effect: 'Failed to run metadata effect',
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
	 * Does nothing because this subscription does not have a bind target.
	 *
	 * @param _
	 */
	public onUpdate(_: unknown): boolean {
		return false;
	}

	public updatable(): boolean {
		return false;
	}

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

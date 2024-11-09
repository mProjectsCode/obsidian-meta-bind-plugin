import type { ComputedSubscriptionDependency } from 'packages/core/src/metadata/ComputedMetadataSubscription';
import type { IMetadataSubscription } from 'packages/core/src/metadata/IMetadataSubscription';
import type { MetadataManager } from 'packages/core/src/metadata/MetadataManager';
import type { BindTargetDeclaration } from 'packages/core/src/parsers/bindTargetParser/BindTargetDeclaration';
import { ErrorLevel, MetaBindInternalError } from 'packages/core/src/utils/errors/MetaBindErrors';
import type { Writable } from 'packages/core/src/utils/Signal';

export class MetadataSubscription implements IMetadataSubscription {
	readonly uuid: string;
	readonly callbackSignal: Writable<unknown>;

	readonly metadataManager: MetadataManager;

	readonly bindTarget: BindTargetDeclaration;

	deleted: boolean;
	readonly onDelete: () => void;

	constructor(
		uuid: string,
		callbackSignal: Writable<unknown>,
		metadataManager: MetadataManager,
		bindTarget: BindTargetDeclaration,
		onDelete: () => void,
	) {
		this.uuid = uuid;
		this.callbackSignal = callbackSignal;
		this.metadataManager = metadataManager;
		this.bindTarget = bindTarget;
		this.onDelete = onDelete;

		this.deleted = false;
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
	public update(value: unknown): void {
		this.metadataManager.write(value, this.bindTarget, this.uuid);
	}

	/**
	 * DO NOT CALL!
	 *
	 * Notifies the subscription of an updated value in the cache.
	 *
	 * @param value
	 */
	public notify(value: unknown): void {
		try {
			this.callbackSignal.set(value);
		} catch (e) {
			const error = e instanceof Error ? e : String(e);

			console.warn(
				new MetaBindInternalError({
					errorLevel: ErrorLevel.ERROR,
					effect: 'Failed to notify subscription of updated value in the cache',
					cause: error,
				}),
			);
		}
	}

	public getDependencies(): ComputedSubscriptionDependency[] {
		return [];
	}

	/**
	 * DO NOT CALL!
	 *
	 * Called by the metadata manager when it wants to delete the subscription.
	 */
	public delete(): void {
		this.deleted = true;
		this.onDelete();
	}
}

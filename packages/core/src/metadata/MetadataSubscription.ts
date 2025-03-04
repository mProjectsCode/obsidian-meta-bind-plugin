import type { IMetadataSubscription } from 'packages/core/src/metadata/IMetadataSubscription';
import type { MetadataManager } from 'packages/core/src/metadata/MetadataManager';
import type { BindTargetDeclaration } from 'packages/core/src/parsers/bindTargetParser/BindTargetDeclaration';
import { ErrorLevel, MetaBindInternalError } from 'packages/core/src/utils/errors/MetaBindErrors';
import type { Writable } from 'packages/core/src/utils/Signal';
import { areObjectsEqual } from 'packages/core/src/utils/Utils';

export class MetadataSubscription implements IMetadataSubscription {
	readonly uuid: string;
	readonly callbackSignal: Writable<unknown>;
	private value: unknown;

	readonly metadataManager: MetadataManager;

	readonly bindTarget: BindTargetDeclaration;

	deleted: boolean;
	private readonly onDelete: () => void;

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
		this.value = undefined;
	}

	/**
	 * Unsubscribes from the cache.
	 */
	public unsubscribe(): void {
		this.metadataManager.unsubscribe(this);
	}

	/**
	 * Updates the cache when the given value is different from the current cache value.
	 *
	 * @param value
	 */
	public write(value: unknown): void {
		const currentValue = this.metadataManager.readShortLived(this.bindTarget);
		if (!areObjectsEqual(currentValue, value)) {
			this.value = value;
			this.metadataManager.write(value, this.bindTarget, this.uuid);
		}
	}

	/**
	 * DO NOT CALL!
	 *
	 * Notifies the subscription of an updated value in the cache.
	 *
	 * @param value
	 */
	public onUpdate(value: unknown): boolean {
		try {
			if (!areObjectsEqual(this.value, value)) {
				this.value = value;
				this.callbackSignal.set(value);

				return true;
			}
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

		return false;
	}

	public updatable(): boolean {
		return true;
	}

	public getDependencies(): BindTargetDeclaration[] {
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

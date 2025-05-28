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
			// note: write already clones the value
			this.metadataManager.write(value, this.bindTarget, this.uuid);
		}
	}

	/**
	 * Reads the value from the cache.
	 * Does not update the subscription.
	 *
	 */
	public read(): unknown {
		return this.metadataManager.read(this.bindTarget);
	}

	public onUpdate(value: unknown): boolean {
		// The value is NOT cloned, but that's fine for the comparison.
		// If we actually notify the callback, we need to clone the value, as we can't guarantee that the callback won't modify it.
		try {
			if (!areObjectsEqual(this.value, value)) {
				const clonedValue = structuredClone(value);
				this.value = clonedValue;
				this.callbackSignal.set(clonedValue);

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

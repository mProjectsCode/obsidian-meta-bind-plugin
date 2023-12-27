import { type IMetadataSubscription } from './IMetadataSubscription';
import { type Signal } from '../utils/Signal';
import { type MetadataManager } from './MetadataManager';

import { type ComputedSubscriptionDependency } from './ComputedMetadataSubscription';
import { type BindTargetDeclaration } from '../parsers/bindTargetParser/BindTargetDeclaration';

export class MetadataSubscription implements IMetadataSubscription {
	readonly uuid: string;
	readonly callbackSignal: Signal<unknown>;

	readonly metadataManager: MetadataManager;

	readonly bindTarget: BindTargetDeclaration;

	deleted: boolean;
	readonly onDelete: () => void;

	constructor(
		uuid: string,
		callbackSignal: Signal<unknown>,
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
		this.metadataManager.updateCache(value, this);
	}

	/**
	 * DO NOT CALL!
	 *
	 * Notifies the subscription of an updated value in the cache.
	 *
	 * @param value
	 */
	public notify(value: unknown): void {
		this.callbackSignal.set(value);
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

import { type IMetadataSubscription } from './IMetadataSubscription';
import { type Signal } from '../utils/Signal';
import { type MetadataManager } from './MetadataManager';
import { type FullBindTarget } from '../parsers/inputFieldParser/InputFieldDeclaration';

import { type ComputedSubscriptionDependency } from './ComputedMetadataSubscription';

export class MetadataSubscription implements IMetadataSubscription {
	readonly uuid: string;
	readonly callbackSignal: Signal<unknown>;

	readonly metadataManager: MetadataManager;

	readonly bindTarget: FullBindTarget;

	constructor(uuid: string, callbackSignal: Signal<unknown>, metadataManager: MetadataManager, bindTarget: FullBindTarget) {
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
}

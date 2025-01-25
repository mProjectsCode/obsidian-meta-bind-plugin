import type { BindTargetDeclaration } from 'packages/core/src/parsers/bindTargetParser/BindTargetDeclaration';

/**
 * Interface for a metadata subscription.
 */
export interface IMetadataSubscription {
	/**
	 * UUID for identification.
	 */
	uuid: string;
	/**
	 * Whether the subscription has been deleted. Used as a flag to prevent double deletion.
	 */
	deleted: boolean;
	/**
	 * The property the subscription is bound to and thus watches.
	 */
	bindTarget: BindTargetDeclaration | undefined;
	/**
	 * Unsubscribes from the cache.
	 */
	unsubscribe: () => void;
	/**
	 * Called when the metadata manager wats to delete the subscription.
	 */
	delete: () => void;
	/**
	 * Called by the metadata manager when the cache receives an update that concerns this subscription.
	 *
	 * @param value
	 */
	onUpdate: (value: unknown) => void;
	/**
	 * Returns the dependencies of this subscription or an empty array if there are none.
	 */
	getDependencies: () => BindTargetDeclaration[];
}

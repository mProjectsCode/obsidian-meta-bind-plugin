import { type FullBindTarget } from '../parsers/inputFieldParser/InputFieldDeclaration';

import { type ComputedSubscriptionDependency } from './ComputedMetadataSubscription';

/**
 * Interface for a metadata subscription.
 */
export interface IMetadataSubscription {
	/**
	 * UUID for identification.
	 */
	uuid: string;
	/**
	 * Whether the subscription has been deleted. Useful to avoid infinite loops during deletion.
	 */
	deleted: boolean;
	/**
	 * The property the subscription is bound to and thus watches.
	 */
	bindTarget: FullBindTarget | undefined;
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
	notify: (value: unknown) => void;
	/**
	 * Returns the dependencies of this subscription or an empty array if there are none.
	 */
	getDependencies: () => ComputedSubscriptionDependency[];
}
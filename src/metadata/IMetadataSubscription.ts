import { type FullBindTarget } from '../parsers/inputFieldParser/InputFieldDeclaration';

import { type ComputedSubscriptionDependency } from './ComputedMetadataSubscription';

export interface IMetadataSubscription {
	uuid: string;
	bindTarget: FullBindTarget | undefined;
	unsubscribe: () => void;
	notify: (value: unknown) => void;
	getDependencies: () => ComputedSubscriptionDependency[];
}

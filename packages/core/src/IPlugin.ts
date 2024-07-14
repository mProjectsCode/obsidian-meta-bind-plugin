import type { MetaBindPluginSettings } from 'packages/core/src/Settings';
import type { API } from 'packages/core/src/api/API';
import type { InternalAPI } from 'packages/core/src/api/InternalAPI';
import type { MetadataManager } from 'packages/core/src/metadata/MetadataManager';
import type { MountableManager } from 'packages/core/src/MountableManager';

export interface IPlugin {
	readonly api: API<IPlugin>;
	readonly internal: InternalAPI<IPlugin>;
	readonly metadataManager: MetadataManager;
	readonly mountableManager: MountableManager;

	settings: MetaBindPluginSettings;
}

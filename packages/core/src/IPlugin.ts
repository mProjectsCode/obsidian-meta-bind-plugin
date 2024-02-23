import { type MetaBindPluginSettings } from 'packages/core/src/Settings';
import { type API } from 'packages/core/src/api/API';
import { type InternalAPI } from 'packages/core/src/api/InternalAPI';
import { type MetadataManager } from 'packages/core/src/metadata/MetadataManager';

export interface IPlugin {
	readonly api: API<IPlugin>;
	readonly internal: InternalAPI<IPlugin>;
	readonly metadataManager: MetadataManager;

	settings: MetaBindPluginSettings;
}

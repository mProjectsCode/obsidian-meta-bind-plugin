import { type API } from 'packages/core/src/api/API';
import { type MetaBindPluginSettings } from 'packages/core/src/Settings';
import { type MetadataManager } from 'packages/core/src/metadata/MetadataManager';
import { type IInternalAPI } from 'packages/core/src/api/IInternalAPI';

export interface IPlugin {
	readonly api: API<IPlugin>;
	readonly internal: IInternalAPI;
	readonly metadataManager: MetadataManager;

	settings: MetaBindPluginSettings;
}

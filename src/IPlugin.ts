import { type API } from './api/API';
import { type MetaBindPluginSettings } from './settings/Settings';
import { type MetadataManager } from './metadata/MetadataManager';
import { type IInternalAPI } from './api/IInternalAPI';

export interface IPlugin {
	readonly api: API<IPlugin>;
	readonly internal: IInternalAPI;
	readonly metadataManager: MetadataManager;

	settings: MetaBindPluginSettings;
}

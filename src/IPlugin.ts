import { type IAPI } from './api/IAPI';
import { type MetaBindPluginSettings } from './settings/Settings';
import { type MetadataManager } from './metadata/MetadataManager';
import { type IInternalAPI } from './api/internalApi/IInternalAPI';

export interface IPlugin {
	readonly api: IAPI;
	readonly internal: IInternalAPI;
	readonly metadataManager: MetadataManager;

	settings: MetaBindPluginSettings;
}

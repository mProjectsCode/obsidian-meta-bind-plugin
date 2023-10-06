import { IAPI } from './api/IAPI';
import { MetaBindPluginSettings } from './settings/Settings';

export interface IPlugin {
	api: IAPI;
	settings: MetaBindPluginSettings;
	getFilePathsByName: (name: string) => string[];
}

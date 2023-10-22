import { type IAPI } from './api/IAPI';
import { type MetaBindPluginSettings } from './settings/Settings';

export interface IPlugin {
	api: IAPI;
	settings: MetaBindPluginSettings;
	getFilePathsByName: (name: string) => string[];
}

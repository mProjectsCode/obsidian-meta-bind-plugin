import { IAPI } from './api/IAPI';

export interface IPlugin {
	api: IAPI;
	getFilePathsByName: (name: string) => string[];
}

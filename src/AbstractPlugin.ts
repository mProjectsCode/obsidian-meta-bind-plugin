import { MetaBindPluginSettings } from './settings/Settings';
import { MDRCManager } from './MDRCManager';
import { AbstractMetadataManager } from './metadata/AbstractMetadataManager';
import { MetadataFileCache } from './metadata/MetadataManager';
import { PublishMetadataFileCache } from './metadata/PublishMetadataManager';
import { API } from './api/API';

export interface AbstractPlugin {
	settings: MetaBindPluginSettings;
	mdrcManager: MDRCManager;
	metadataManager: AbstractMetadataManager<MetadataFileCache | PublishMetadataFileCache>;
	api: API;

	getFilePathsByName: (name: string) => string[];
}

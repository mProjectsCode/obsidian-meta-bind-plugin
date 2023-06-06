import { Listener } from '../utils/Signal';
import { TFile } from 'obsidian';

export interface MetadataFileCacheListener extends Listener<any | undefined> {
	metadataPath: string[];
}

export interface MetadataFileCache {
	file: TFile;
	metadata: Record<string, any>;
	listeners: MetadataFileCacheListener[];
	cyclesSinceLastUserInput: number;
	changed: boolean;
}

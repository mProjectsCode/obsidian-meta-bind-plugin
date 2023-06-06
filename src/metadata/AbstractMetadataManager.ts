import { Signal } from '../utils/Signal';
import { MetadataFileCache } from './MetadataManager';
import { PublishMetadataFileCache } from './PublishMetadataManager';

export abstract class AbstractMetadataManager<T extends MetadataFileCache | PublishMetadataFileCache> {
	abstract register(filePath: string, frontmatter: any | null | undefined, signal: Signal<any | undefined>, metadataPath: string[], uuid: string): T;

	abstract unregister(filePath: string, uuid: string): void;

	abstract getCacheForFile(filePath: string): T | undefined;

	abstract updateCache(metadata: Record<string, any>, filePath: string, uuid?: string | undefined): void;

	abstract updatePropertyInCache(value: any, pathParts: string[], filePath: string, uuid?: string | undefined): void;

	abstract notifyListeners(fileCache: T, metadataPath?: string[] | undefined, exceptUuid?: string | undefined): void;
}

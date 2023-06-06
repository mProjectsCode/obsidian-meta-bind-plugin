import { ErrorLevel, MetaBindBindTargetError } from '../utils/errors/MetaBindErrors';
import { parsePath } from '@opd-libs/opd-utils-lib/lib/ObjectTraversalUtils';
import { IPlugin } from '../IPlugin';

export interface BindTargetDeclaration {
	filePath: string;
	fileName: string;
	metadataFieldName: string;
	metadataPath: string[];
}

export class BindTargetParser {
	plugin: IPlugin;

	constructor(plugin: IPlugin) {
		this.plugin = plugin;
	}

	parseBindTarget(bindTargetString: string, fallbackFilePath: string): BindTargetDeclaration {
		if (!bindTargetString) {
			throw new MetaBindBindTargetError(ErrorLevel.CRITICAL, 'failed to parse bind target', 'bind target is empty');
		}

		const bindTargetDeclaration: BindTargetDeclaration = {} as BindTargetDeclaration;

		const bindTargetParts: string[] = bindTargetString.split('#');

		if (bindTargetParts.length === 1) {
			// the bind target is in the same file
			bindTargetDeclaration.fileName = fallbackFilePath;
			bindTargetDeclaration.metadataFieldName = bindTargetString;
		} else if (bindTargetParts.length === 2) {
			// the bind target is in another file
			bindTargetDeclaration.fileName = bindTargetParts[0];
			bindTargetDeclaration.metadataFieldName = bindTargetParts[1];
		} else {
			throw new MetaBindBindTargetError(ErrorLevel.CRITICAL, 'failed to parse bind target', "bind target may only contain one '#' to specify the metadata field");
		}

		try {
			bindTargetDeclaration.metadataPath = parsePath(bindTargetDeclaration.metadataFieldName);
		} catch (e) {
			if (e instanceof Error) {
				throw new MetaBindBindTargetError(ErrorLevel.CRITICAL, 'failed to parse bind target', `bind target path parsing error: ${e?.message}`);
			}
		}

		const filePaths: string[] = this.plugin.getFilePathsByName(bindTargetDeclaration.fileName);
		if (filePaths.length === 0) {
			throw new MetaBindBindTargetError(ErrorLevel.CRITICAL, 'failed to parse bind target', 'bind target file not found');
		} else if (filePaths.length === 1) {
			bindTargetDeclaration.filePath = filePaths[0];
		} else {
			throw new MetaBindBindTargetError(ErrorLevel.CRITICAL, 'failed to parse bind target', 'bind target resolves to multiple files, please also specify the file path');
		}

		return bindTargetDeclaration;
	}
}

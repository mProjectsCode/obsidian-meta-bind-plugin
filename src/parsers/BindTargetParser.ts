import { MetaBindBindTargetError } from '../utils/MetaBindErrors';
import { parsePath } from '@opd-libs/opd-utils-lib/lib/ObjectTraversalUtils';
import { TFile } from 'obsidian';
import MetaBindPlugin from '../main';

export interface BindTargetDeclaration {
	file: TFile;
	fileName: string;
	metadataFieldName: string;
	metadataPath: string[];
}

export class BindTargetParser {
	plugin: MetaBindPlugin;

	constructor(plugin: MetaBindPlugin) {
		this.plugin = plugin;
	}

	parseBindTarget(bindTargetString: string, fallbackFilePath: string): BindTargetDeclaration {
		if (!bindTargetString) {
			throw new MetaBindBindTargetError('bind target is empty');
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
			throw new MetaBindBindTargetError("bind target may only contain one '#' to specify the metadata field");
		}

		try {
			bindTargetDeclaration.metadataPath = parsePath(bindTargetDeclaration.metadataFieldName);
		} catch (e) {
			if (e instanceof Error) {
				throw new MetaBindBindTargetError(`bind target path parsing error: ${e?.message}`);
			}
		}

		const files: TFile[] = this.plugin.getFilesByName(bindTargetDeclaration.fileName);
		if (files.length === 0) {
			throw new MetaBindBindTargetError('bind target file not found');
		} else if (files.length === 1) {
			bindTargetDeclaration.file = files[0];
		} else {
			throw new MetaBindBindTargetError('bind target resolves to multiple files, please also specify the file path');
		}

		return bindTargetDeclaration;
	}
}

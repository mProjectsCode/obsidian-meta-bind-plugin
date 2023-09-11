import { ErrorLevel, MetaBindBindTargetError } from '../utils/errors/MetaBindErrors';
import { parsePath } from '@opd-libs/opd-utils-lib/lib/ObjectTraversalUtils';
import { IPlugin } from '../IPlugin';
import { UnvalidatedBindTargetDeclaration } from './newInputFieldParser/InputFieldDeclarationValidator';
import { BIND_TARGET } from './nomParsers/Parsers';

export interface BindTargetDeclaration {
	filePath: string | undefined;
	metadataPath: string[];
}

export class BindTargetParser {
	plugin: IPlugin;

	constructor(plugin: IPlugin) {
		this.plugin = plugin;
	}

	parseAndValidateBindTarget(bindTargetString: string): BindTargetDeclaration {
		return this.validateBindTarget(this.parseBindTarget(bindTargetString));
	}

	parseBindTarget(bindTargetString: string): UnvalidatedBindTargetDeclaration {
		return BIND_TARGET.parse(bindTargetString) as UnvalidatedBindTargetDeclaration;
	}

	validateBindTarget(unvalidatedBindTargetDeclaration: UnvalidatedBindTargetDeclaration): BindTargetDeclaration {
		const bindTargetDeclaration: BindTargetDeclaration = {} as BindTargetDeclaration;

		const filePath = unvalidatedBindTargetDeclaration.file?.value;
		if (filePath) {
			const filePaths: string[] = this.plugin.getFilePathsByName(filePath);
			if (filePaths.length === 0) {
				throw new MetaBindBindTargetError(ErrorLevel.CRITICAL, 'failed to parse bind target', 'bind target file not found');
			} else if (filePaths.length === 1) {
				bindTargetDeclaration.filePath = filePaths[0];
			} else {
				throw new MetaBindBindTargetError(
					ErrorLevel.CRITICAL,
					'failed to parse bind target',
					'bind target resolves to multiple files, please also specify the file path'
				);
			}
		}

		bindTargetDeclaration.metadataPath = unvalidatedBindTargetDeclaration.path.map(x => x.value);

		return bindTargetDeclaration;
	}
}

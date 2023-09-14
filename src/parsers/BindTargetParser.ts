import { ErrorLevel } from '../utils/errors/MetaBindErrors';
import { IPlugin } from '../IPlugin';
import { UnvalidatedBindTargetDeclaration } from './newInputFieldParser/InputFieldDeclarationValidator';
import { BIND_TARGET } from './nomParsers/Parsers';
import { ParsingValidationError } from './ParsingError';

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
		return this.validateBindTarget(bindTargetString, this.parseBindTarget(bindTargetString));
	}

	parseBindTarget(bindTargetString: string): UnvalidatedBindTargetDeclaration {
		return BIND_TARGET.parse(bindTargetString) as UnvalidatedBindTargetDeclaration;
	}

	validateBindTarget(fullDeclaration: string, unvalidatedBindTargetDeclaration: UnvalidatedBindTargetDeclaration): BindTargetDeclaration {
		const bindTargetDeclaration: BindTargetDeclaration = {} as BindTargetDeclaration;

		const filePath = unvalidatedBindTargetDeclaration.file?.value;
		if (filePath !== undefined) {
			const filePaths: string[] = this.plugin.getFilePathsByName(filePath);

			if (filePaths.length === 0) {
				if (unvalidatedBindTargetDeclaration.file?.position) {
					throw new ParsingValidationError(
						ErrorLevel.CRITICAL,
						'Bind Target Validator',
						`Failed to parse bind target. Bind target file path '${unvalidatedBindTargetDeclaration.file.value}' not found.`,
						fullDeclaration,
						unvalidatedBindTargetDeclaration.file.position
					);
				} else {
					throw new ParsingValidationError(
						ErrorLevel.CRITICAL,
						'Bind Target Validator',
						`Failed to parse bind target. Bind target file path '${unvalidatedBindTargetDeclaration.file?.value}' not found.`
					);
				}
			} else if (filePaths.length === 1) {
				bindTargetDeclaration.filePath = filePaths[0];
			} else {
				if (unvalidatedBindTargetDeclaration.file?.position) {
					throw new ParsingValidationError(
						ErrorLevel.CRITICAL,
						'Bind Target Validator',
						`Failed to parse bind target. Bind target file path '${unvalidatedBindTargetDeclaration.file.value}' resolves to multiple files, please also specify the file path.`,
						fullDeclaration,
						unvalidatedBindTargetDeclaration.file.position
					);
				} else {
					throw new ParsingValidationError(
						ErrorLevel.CRITICAL,
						'Bind Target Validator',
						`Failed to parse bind target. Bind target file path '${unvalidatedBindTargetDeclaration.file?.value}' resolves to multiple files, please also specify the file path.`
					);
				}
			}
		}

		bindTargetDeclaration.metadataPath = unvalidatedBindTargetDeclaration.path.map(x => x.value);

		return bindTargetDeclaration;
	}
}

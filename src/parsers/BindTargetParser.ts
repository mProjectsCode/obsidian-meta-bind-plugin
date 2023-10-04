import { ErrorLevel } from '../utils/errors/MetaBindErrors';
import { IPlugin } from '../IPlugin';
import { BIND_TARGET } from './nomParsers/Parsers';
import { ParsingValidationError } from './ParsingError';
import { BindTargetDeclaration, UnvalidatedBindTargetDeclaration } from './inputFieldParser/InputFieldDeclaration';
import { BindTargetScope } from '../metadata/BindTargetScope';

export class BindTargetParser {
	plugin: IPlugin;

	constructor(plugin: IPlugin) {
		this.plugin = plugin;
	}

	parseAndValidateBindTarget(bindTargetString: string, scope?: BindTargetScope | undefined): BindTargetDeclaration {
		return this.validateBindTarget(bindTargetString, this.parseBindTarget(bindTargetString), scope);
	}

	parseBindTarget(bindTargetString: string): UnvalidatedBindTargetDeclaration {
		return BIND_TARGET.parse(bindTargetString) as UnvalidatedBindTargetDeclaration;
	}

	validateBindTarget(
		fullDeclaration: string,
		unvalidatedBindTargetDeclaration: UnvalidatedBindTargetDeclaration,
		scope?: BindTargetScope | undefined
	): BindTargetDeclaration {
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
		bindTargetDeclaration.boundToLocalScope = unvalidatedBindTargetDeclaration.boundToLocalScope;

		return this.resolveScope(bindTargetDeclaration, scope);
	}

	public resolveScope(bindTarget: BindTargetDeclaration, scope?: BindTargetScope | undefined): BindTargetDeclaration {
		if (bindTarget.boundToLocalScope) {
			if (scope === undefined) {
				throw new ParsingValidationError(ErrorLevel.CRITICAL, 'Bind Target Scope Validator', 'Failed to resolve bind target scope, no scope provided');
			} else {
				bindTarget.filePath = scope.scope.filePath;
				bindTarget.metadataPath = scope.scope.metadataPath.concat(bindTarget.metadataPath);
				return bindTarget;
			}
		} else {
			return bindTarget;
		}
	}
}

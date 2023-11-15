import { ErrorLevel } from '../utils/errors/MetaBindErrors';
import { type IPlugin } from '../IPlugin';
import { BIND_TARGET } from './nomParsers/BindTargetParsers';
import { ParsingValidationError, runParser } from './ParsingError';
import {
	type BindTargetDeclaration,
	type FullBindTarget,
	type UnvalidatedBindTargetDeclaration,
} from './inputFieldParser/InputFieldDeclaration';
import { type BindTargetScope } from '../metadata/BindTargetScope';

export class BindTargetParser {
	plugin: IPlugin;

	constructor(plugin: IPlugin) {
		this.plugin = plugin;
	}

	parseAndValidateBindTarget(bindTargetString: string, scope?: BindTargetScope | undefined): BindTargetDeclaration {
		return this.validateBindTarget(bindTargetString, this.parseBindTarget(bindTargetString), scope);
	}

	parseBindTarget(bindTargetString: string): UnvalidatedBindTargetDeclaration {
		return runParser(BIND_TARGET, bindTargetString);
	}

	validateBindTarget(
		fullDeclaration: string,
		unvalidatedBindTargetDeclaration: UnvalidatedBindTargetDeclaration,
		scope?: BindTargetScope | undefined,
	): BindTargetDeclaration {
		const bindTargetDeclaration: BindTargetDeclaration = {} as BindTargetDeclaration;

		const filePath = unvalidatedBindTargetDeclaration.file?.value;
		if (filePath !== undefined) {
			const filePaths: string[] = this.plugin.getFilePathsByName(filePath);

			if (filePaths.length === 0) {
				throw new ParsingValidationError(
					ErrorLevel.ERROR,
					'Bind Target Validator',
					`Failed to parse bind target. Bind target file path '${unvalidatedBindTargetDeclaration.file?.value}' not found.`,
					fullDeclaration,
					unvalidatedBindTargetDeclaration.file?.position,
				);
			} else if (filePaths.length === 1) {
				bindTargetDeclaration.filePath = filePaths[0];
			} else {
				throw new ParsingValidationError(
					ErrorLevel.ERROR,
					'Bind Target Validator',
					`Failed to parse bind target. Bind target file path '${unvalidatedBindTargetDeclaration.file?.value}' resolves to multiple files, please also specify the file path.`,
					fullDeclaration,
					unvalidatedBindTargetDeclaration.file?.position,
				);
			}
		}

		bindTargetDeclaration.metadataPath = unvalidatedBindTargetDeclaration.path.map(x => x.value);
		bindTargetDeclaration.boundToLocalScope = unvalidatedBindTargetDeclaration.boundToLocalScope;
		bindTargetDeclaration.listenToChildren = unvalidatedBindTargetDeclaration.listenToChildren;

		return this.resolveScope(bindTargetDeclaration, scope);
	}

	public resolveScope(bindTarget: BindTargetDeclaration, scope?: BindTargetScope | undefined): BindTargetDeclaration {
		if (bindTarget.boundToLocalScope) {
			if (scope === undefined) {
				throw new ParsingValidationError(
					ErrorLevel.ERROR,
					'Bind Target Scope Validator',
					'Failed to resolve bind target scope, no scope provided',
				);
			} else {
				bindTarget.filePath = scope.scope.filePath;
				bindTarget.metadataPath = scope.scope.metadataPath.concat(bindTarget.metadataPath);
				return bindTarget;
			}
		} else {
			return bindTarget;
		}
	}

	public toFullDeclaration(bindTarget: undefined, filePath: string): undefined;
	public toFullDeclaration(bindTarget: BindTargetDeclaration, filePath: string): FullBindTarget;
	public toFullDeclaration(
		bindTarget: BindTargetDeclaration | undefined,
		filePath: string,
	): FullBindTarget | undefined;
	public toFullDeclaration(
		bindTarget: BindTargetDeclaration | undefined,
		filePath: string,
	): FullBindTarget | undefined {
		if (bindTarget === undefined) {
			return undefined;
		}

		if (bindTarget.filePath === undefined) {
			bindTarget.filePath = filePath;
		}
		return bindTarget as FullBindTarget;
	}
}

import { ErrorLevel } from '../../utils/errors/MetaBindErrors';
import { type IPlugin } from '../../IPlugin';
import { BIND_TARGET } from '../nomParsers/BindTargetNomParsers';
import { ParsingValidationError, runParser } from '../ParsingError';
import { type BindTargetScope } from '../../metadata/BindTargetScope';
import { PropAccess } from '../../utils/prop/PropAccess';
import { PropPath } from '../../utils/prop/PropPath';
import {
	type BindTargetDeclaration,
	BindTargetStorageType,
	type UnvalidatedBindTargetDeclaration,
} from './BindTargetDeclaration';
import { type ParsingResultNode } from '../nomParsers/GeneralNomParsers';

export class BindTargetParser {
	plugin: IPlugin;

	constructor(plugin: IPlugin) {
		this.plugin = plugin;
	}

	parseAndValidateBindTarget(
		bindTargetString: string,
		filePath: string,
		scope?: BindTargetScope | undefined,
	): BindTargetDeclaration {
		return this.validateBindTarget(bindTargetString, this.parseBindTarget(bindTargetString), filePath, scope);
	}

	parseBindTarget(bindTargetString: string): UnvalidatedBindTargetDeclaration {
		return runParser(BIND_TARGET, bindTargetString);
	}

	validateBindTarget(
		fullDeclaration: string,
		unvalidatedBindTargetDeclaration: UnvalidatedBindTargetDeclaration,
		filePath: string,
		scope?: BindTargetScope | undefined,
	): BindTargetDeclaration {
		const bindTargetDeclaration: BindTargetDeclaration = {} as BindTargetDeclaration;

		bindTargetDeclaration.storageProp = new PropPath(
			unvalidatedBindTargetDeclaration.storageProp.map(x => new PropAccess(x.type, x.prop.value)),
		);

		if (unvalidatedBindTargetDeclaration.storageType === undefined) {
			bindTargetDeclaration.storageType = BindTargetStorageType.FRONTMATTER;
		} else {
			bindTargetDeclaration.storageType = this.validateStorageType(
				unvalidatedBindTargetDeclaration.storageType,
				fullDeclaration,
			);
		}

		if (bindTargetDeclaration.storageType === BindTargetStorageType.FRONTMATTER) {
			if (unvalidatedBindTargetDeclaration.storagePath === undefined) {
				bindTargetDeclaration.storagePath = this.validateStoragePathAsFilePath(
					{ value: filePath },
					fullDeclaration,
				);
			} else {
				bindTargetDeclaration.storagePath = this.validateStoragePathAsFilePath(
					unvalidatedBindTargetDeclaration.storagePath,
					fullDeclaration,
				);
			}
		} else if (bindTargetDeclaration.storageType === BindTargetStorageType.MEMORY) {
			if (unvalidatedBindTargetDeclaration.storagePath === undefined) {
				bindTargetDeclaration.storagePath = this.validateStoragePathAsFilePath(
					{ value: filePath },
					fullDeclaration,
				);
			} else {
				bindTargetDeclaration.storagePath = this.validateStoragePathAsFilePath(
					unvalidatedBindTargetDeclaration.storagePath,
					fullDeclaration,
				);
			}
		} else if (bindTargetDeclaration.storageType === BindTargetStorageType.GLOBAL_MEMORY) {
			if (unvalidatedBindTargetDeclaration.storagePath !== undefined) {
				throw new ParsingValidationError(
					ErrorLevel.ERROR,
					'Bind Target Validator',
					`Failed to parse bind target. Bind target storage type GLOBAL_MEMORY does not support a storage path.`,
					fullDeclaration,
					unvalidatedBindTargetDeclaration.storagePath.position,
				);
			}
			bindTargetDeclaration.storagePath = '';
		} else if (bindTargetDeclaration.storageType === BindTargetStorageType.SCOPE) {
			if (unvalidatedBindTargetDeclaration.storagePath !== undefined) {
				throw new ParsingValidationError(
					ErrorLevel.ERROR,
					'Bind Target Validator',
					`Failed to parse bind target. Bind target storage type SCOPE does not support a storage path.`,
					fullDeclaration,
					unvalidatedBindTargetDeclaration.storagePath.position,
				);
			}
			bindTargetDeclaration.storagePath = '';
			this.resolveScope(bindTargetDeclaration, scope);
		}

		bindTargetDeclaration.listenToChildren = unvalidatedBindTargetDeclaration.listenToChildren;

		return bindTargetDeclaration;
	}

	private resolveScope(
		bindTarget: BindTargetDeclaration,
		scope?: BindTargetScope | undefined,
	): BindTargetDeclaration {
		if (scope === undefined) {
			throw new ParsingValidationError(
				ErrorLevel.ERROR,
				'Bind Target Scope Validator',
				'Failed to resolve bind target scope, no scope provided',
			);
		} else {
			console.log('resolve scope', bindTarget, scope.scope);

			bindTarget.storageType = scope.scope.storageType;
			bindTarget.storagePath = scope.scope.storagePath;
			bindTarget.storageProp = scope.scope.storageProp.concat(bindTarget.storageProp);
			return bindTarget;
		}
	}

	private validateStorageType(storageType: ParsingResultNode, fullDeclaration: string): BindTargetStorageType {
		for (const entry of Object.entries(BindTargetStorageType)) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
			if (entry[1] === storageType?.value) {
				return entry[1];
			}
		}

		throw new ParsingValidationError(
			ErrorLevel.ERROR,
			'Bind Target Validator',
			`Encountered invalid identifier. Expected token to be a storage type but received '${storageType?.value}'.`,
			fullDeclaration,
			storageType?.position,
		);
	}

	private validateStoragePathAsFilePath(
		storagePathResultNode: ParsingResultNode | undefined,
		fullDeclaration: string,
	): string {
		const storagePath = storagePathResultNode?.value;
		if (storagePath === undefined) {
			throw new ParsingValidationError(
				ErrorLevel.ERROR,
				'Bind Target Validator',
				`Failed to parse bind target. Bind target storage path is undefined.`,
				fullDeclaration,
				storagePathResultNode?.position,
			);
		}

		const filePath: string | undefined = this.plugin.internal.getFilePathByName(storagePath);

		if (filePath === undefined) {
			throw new ParsingValidationError(
				ErrorLevel.ERROR,
				'Bind Target Validator',
				`Failed to parse bind target. Bind target file path '${storagePath}' not found.`,
				fullDeclaration,
				storagePathResultNode?.position,
			);
		} else {
			return filePath;
		}
	}
}

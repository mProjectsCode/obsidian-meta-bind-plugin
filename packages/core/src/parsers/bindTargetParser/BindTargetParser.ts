import type { IPlugin } from 'packages/core/src/IPlugin';
import type { BindTargetScope } from 'packages/core/src/metadata/BindTargetScope';
import type {
	BindTargetDeclaration,
	UnvalidatedBindTargetDeclaration,
} from 'packages/core/src/parsers/bindTargetParser/BindTargetDeclaration';
import { P_BindTarget } from 'packages/core/src/parsers/nomParsers/BindTargetNomParsers';
import type { ParsingResultNode } from 'packages/core/src/parsers/nomParsers/GeneralNomParsers';
import { toResultNode } from 'packages/core/src/parsers/nomParsers/GeneralNomParsers';
import { ParsingValidationError, runParser } from 'packages/core/src/parsers/ParsingError';
import { ErrorLevel, MetaBindInternalError } from 'packages/core/src/utils/errors/MetaBindErrors';
import { PropAccess } from 'packages/core/src/utils/prop/PropAccess';
import { PropPath } from 'packages/core/src/utils/prop/PropPath';

export class BindTargetParser {
	plugin: IPlugin;

	constructor(plugin: IPlugin) {
		this.plugin = plugin;
	}

	fromString(declarationString: string): UnvalidatedBindTargetDeclaration {
		return runParser(P_BindTarget, declarationString);
	}

	fromStringAndValidate(
		bindTargetString: string,
		filePath: string,
		scope?: BindTargetScope | undefined,
	): BindTargetDeclaration {
		return this.validate(bindTargetString, this.fromString(bindTargetString), filePath, scope);
	}

	fromExistingDeclaration(declaration: BindTargetDeclaration): UnvalidatedBindTargetDeclaration;
	fromExistingDeclaration(
		declaration: BindTargetDeclaration | undefined,
	): UnvalidatedBindTargetDeclaration | undefined;
	fromExistingDeclaration(
		declaration: BindTargetDeclaration | undefined,
	): UnvalidatedBindTargetDeclaration | undefined {
		if (declaration === undefined) {
			return undefined;
		}
		return {
			storageType: toResultNode(declaration.storageType),
			storagePath: toResultNode(declaration.storagePath),
			storageProp: declaration.storageProp.path.map(x => ({
				type: x.type,
				prop: toResultNode(x.prop),
			})),
			listenToChildren: declaration.listenToChildren,
		};
	}

	validate(
		fullDeclaration: string | undefined,
		unvalidatedBindTargetDeclaration: UnvalidatedBindTargetDeclaration,
		filePath: string,
		scope?: BindTargetScope | undefined,
	): BindTargetDeclaration {
		const bindTargetDeclaration: BindTargetDeclaration = {} as BindTargetDeclaration;

		// listen to children
		bindTargetDeclaration.listenToChildren = unvalidatedBindTargetDeclaration.listenToChildren;

		// storage prop
		bindTargetDeclaration.storageProp = new PropPath(
			unvalidatedBindTargetDeclaration.storageProp.map(x => new PropAccess(x.type, x.prop.value)),
		);

		// storage type
		if (unvalidatedBindTargetDeclaration.storageType === undefined) {
			bindTargetDeclaration.storageType = this.plugin.metadataManager.defaultSource;
		} else {
			bindTargetDeclaration.storageType = this.validateStorageType(
				unvalidatedBindTargetDeclaration.storageType,
				fullDeclaration,
			);
		}

		// storage path
		const hadStoragePath = unvalidatedBindTargetDeclaration.storagePath !== undefined;
		const storagePathToValidate: ParsingResultNode = unvalidatedBindTargetDeclaration.storagePath ?? {
			value: filePath,
		};

		const source = this.plugin.metadataManager.getSource(bindTargetDeclaration.storageType);
		if (source === undefined) {
			throw new MetaBindInternalError({
				errorLevel: ErrorLevel.CRITICAL,
				effect: 'can not validate bind target',
				cause: `Source '${bindTargetDeclaration.storageType}' not found. But validation was successful. This should not happen.`,
				context: {
					fullDeclaration: fullDeclaration,
					sources: [...this.plugin.metadataManager.sources.keys()],
				},
			});
		}

		bindTargetDeclaration.storagePath = source.validateStoragePath(
			storagePathToValidate,
			hadStoragePath,
			fullDeclaration,
			this,
		);

		// resolve scope
		return source.resolveBindTargetScope(bindTargetDeclaration, scope, this);
	}

	public resolveScope(bindTarget: BindTargetDeclaration, scope?: BindTargetScope | undefined): BindTargetDeclaration {
		if (scope === undefined) {
			throw new ParsingValidationError(
				ErrorLevel.ERROR,
				'Bind Target Scope Validator',
				'Failed to resolve bind target scope, no scope provided',
			);
		} else {
			bindTarget.storageType = scope.scope.storageType;
			bindTarget.storagePath = scope.scope.storagePath;
			bindTarget.storageProp = scope.scope.storageProp.concat(bindTarget.storageProp);
			return bindTarget;
		}
	}

	public validateStorageType(storageType: ParsingResultNode, fullDeclaration: string | undefined): string {
		for (const source of this.plugin.metadataManager.iterateSources()) {
			if (source === storageType.value) {
				return source;
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

	public validateStoragePathAsFilePath(
		storagePathResultNode: ParsingResultNode | undefined,
		fullDeclaration: string | undefined,
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

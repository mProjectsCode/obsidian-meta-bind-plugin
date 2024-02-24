import { type IPlugin } from 'packages/core/src/IPlugin';
import { ViewFieldType } from 'packages/core/src/config/FieldConfigs';
import { type BindTargetScope } from 'packages/core/src/metadata/BindTargetScope';
import { runParser } from 'packages/core/src/parsers/ParsingError';
import { VIEW_FIELD_FULL_DECLARATION } from 'packages/core/src/parsers/nomParsers/ViewFieldNomParsers';
import {
	type PartialUnvalidatedViewFieldDeclaration,
	type SimpleViewFieldDeclaration,
	type UnvalidatedViewFieldDeclaration,
	type ViewFieldDeclaration,
} from 'packages/core/src/parsers/viewFieldParser/ViewFieldDeclaration';
import { ViewFieldDeclarationValidator } from 'packages/core/src/parsers/viewFieldParser/ViewFieldDeclarationValidator';
import { ErrorCollection } from 'packages/core/src/utils/errors/ErrorCollection';

export class ViewFieldParser {
	plugin: IPlugin;

	constructor(plugin: IPlugin) {
		this.plugin = plugin;
	}

	fromString(fullDeclaration: string): UnvalidatedViewFieldDeclaration {
		const errorCollection = new ErrorCollection('ViewFieldDeclaration');

		try {
			const parserResult = runParser(VIEW_FIELD_FULL_DECLARATION, fullDeclaration);

			return this.partialToFullDeclaration(parserResult, fullDeclaration, errorCollection);
		} catch (e) {
			errorCollection.add(e);
		}

		return {
			declarationString: fullDeclaration,
			errorCollection: errorCollection,
			viewFieldType: { value: ViewFieldType.INVALID },
			writeToBindTarget: undefined,
			arguments: [],
			templateDeclaration: [],
		};
	}

	fromStringAndValidate(
		declarationString: string,
		filePath: string,
		scope?: BindTargetScope | undefined,
	): ViewFieldDeclaration {
		return this.validate(this.fromString(declarationString), filePath, scope);
	}

	fromSimpleDeclaration(simpleDeclaration: SimpleViewFieldDeclaration): UnvalidatedViewFieldDeclaration {
		const errorCollection = new ErrorCollection('ViewFieldDeclaration');

		return {
			declarationString: undefined,
			templateDeclaration: (simpleDeclaration.templateDeclaration ?? []).map(x => {
				if (typeof x === 'string') {
					return x;
				} else {
					return this.plugin.api.bindTargetParser.fromSimpleDeclaration(x);
				}
			}),
			viewFieldType: simpleDeclaration.viewFieldType ? { value: simpleDeclaration.viewFieldType } : undefined,
			arguments: (simpleDeclaration.arguments ?? []).map(x => ({
				name: { value: x.name },
				value: x.value.map(y => ({ value: y })),
			})),
			writeToBindTarget: simpleDeclaration.writeToBindTarget
				? this.plugin.api.bindTargetParser.fromSimpleDeclaration(simpleDeclaration.writeToBindTarget)
				: undefined,
			errorCollection: errorCollection,
		};
	}

	fromSimpleDeclarationAndValidate(
		simpleDeclaration: SimpleViewFieldDeclaration,
		filePath: string,
		scope?: BindTargetScope | undefined,
	): ViewFieldDeclaration {
		return this.validate(this.fromSimpleDeclaration(simpleDeclaration), filePath, scope);
	}

	private partialToFullDeclaration(
		unvalidatedDeclaration: PartialUnvalidatedViewFieldDeclaration,
		declarationString: string | undefined,
		errorCollection: ErrorCollection,
	): UnvalidatedViewFieldDeclaration {
		return {
			...structuredClone(unvalidatedDeclaration),
			declarationString: declarationString,
			errorCollection: errorCollection,
		};
	}

	validate(
		unvalidatedDeclaration: UnvalidatedViewFieldDeclaration,
		filePath: string,
		scope?: BindTargetScope | undefined,
	): ViewFieldDeclaration {
		const validator = new ViewFieldDeclarationValidator(unvalidatedDeclaration, filePath, this.plugin);

		return validator.validate(scope);
	}
}

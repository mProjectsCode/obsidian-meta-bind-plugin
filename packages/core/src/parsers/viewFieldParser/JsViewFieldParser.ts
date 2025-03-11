import type { MetaBind } from 'packages/core/src';
import { P_JsViewFieldDeclaration } from 'packages/core/src/parsers/nomParsers/ViewFieldNomParsers';
import { runParser } from 'packages/core/src/parsers/ParsingError';
import type {
	JsViewFieldDeclaration,
	PartialUnvalidatedJsViewFieldDeclaration,
	SimpleJsViewFieldDeclaration,
	UnvalidatedJsViewFieldDeclaration,
} from 'packages/core/src/parsers/viewFieldParser/ViewFieldDeclaration';
import { ErrorCollection } from 'packages/core/src/utils/errors/ErrorCollection';

export class JsViewFieldParser {
	mb: MetaBind;

	constructor(mb: MetaBind) {
		this.mb = mb;
	}

	fromString(fullDeclaration: string): UnvalidatedJsViewFieldDeclaration {
		const errorCollection = new ErrorCollection('JsViewFieldDeclaration');

		try {
			const parserResult = runParser(P_JsViewFieldDeclaration, fullDeclaration);

			return this.partialToFullDeclaration(parserResult, fullDeclaration, errorCollection);
		} catch (e) {
			errorCollection.add(e);
		}

		return {
			declarationString: fullDeclaration,
			errorCollection: errorCollection,
			bindTargetMappings: [],
			writeToBindTarget: undefined,
			hidden: false,
			code: '',
		};
	}

	public fromStringAndValidate(fullDeclaration: string, filePath: string): JsViewFieldDeclaration {
		return this.validate(this.fromString(fullDeclaration), filePath);
	}

	public fromSimpleDeclaration(simpleDeclaration: SimpleJsViewFieldDeclaration): UnvalidatedJsViewFieldDeclaration {
		const errorCollection = new ErrorCollection('JsViewFieldDeclaration');

		return {
			declarationString: undefined,
			code: simpleDeclaration.code,
			bindTargetMappings: simpleDeclaration.bindTargetMappings.map(x => {
				return {
					bindTarget: this.mb.bindTargetParser.fromExistingDeclaration(x.bindTarget),
					name: x.name,
				};
			}),
			writeToBindTarget: this.mb.bindTargetParser.fromExistingDeclaration(simpleDeclaration.writeToBindTarget),
			hidden: simpleDeclaration.hidden ?? false,
			errorCollection: errorCollection,
		};
	}

	public fromSimpleDeclarationAndValidate(
		simpleDeclaration: SimpleJsViewFieldDeclaration,
		filePath: string,
	): JsViewFieldDeclaration {
		return this.validate(this.fromSimpleDeclaration(simpleDeclaration), filePath);
	}

	private partialToFullDeclaration(
		unvalidatedDeclaration: PartialUnvalidatedJsViewFieldDeclaration,
		fullDeclaration: string | undefined,
		errorCollection: ErrorCollection,
	): UnvalidatedJsViewFieldDeclaration {
		const declaration = unvalidatedDeclaration as UnvalidatedJsViewFieldDeclaration;
		declaration.declarationString = fullDeclaration;
		declaration.errorCollection = errorCollection;
		declaration.bindTargetMappings = [...declaration.bindTargetMappings]; // copy array to avoid modifying the original

		return declaration;
	}

	public validate(
		unvalidatedDeclaration: UnvalidatedJsViewFieldDeclaration,
		filePath: string,
	): JsViewFieldDeclaration {
		const declaration: JsViewFieldDeclaration = {} as JsViewFieldDeclaration;

		declaration.declarationString = unvalidatedDeclaration.declarationString;
		declaration.errorCollection = unvalidatedDeclaration.errorCollection;

		try {
			declaration.bindTargetMappings = unvalidatedDeclaration.bindTargetMappings.map(x => {
				return {
					bindTarget: this.mb.bindTargetParser.validate(
						unvalidatedDeclaration.declarationString,
						x.bindTarget,
						filePath,
					),
					name: x.name,
				};
			});

			if (unvalidatedDeclaration.writeToBindTarget !== undefined) {
				declaration.writeToBindTarget = this.mb.bindTargetParser.validate(
					unvalidatedDeclaration.declarationString,
					unvalidatedDeclaration.writeToBindTarget,
					filePath,
				);
			}

			declaration.code = unvalidatedDeclaration.code;
			declaration.hidden = unvalidatedDeclaration.hidden;

			return declaration;
		} catch (e) {
			declaration.errorCollection.add(e);
		}

		return {
			declarationString: unvalidatedDeclaration.declarationString,
			errorCollection: declaration.errorCollection,
			bindTargetMappings: [],
			writeToBindTarget: undefined,
			hidden: false,
			code: '',
		};
	}
}

import { ErrorCollection } from '../../utils/errors/ErrorCollection';
import { JS_VIEW_FIELD_DECLARATION, VIEW_FIELD_FULL_DECLARATION } from '../nomParsers/ViewFieldParsers';
import { type IPlugin } from '../../IPlugin';
import { type BindTargetScope } from '../../metadata/BindTargetScope';
import {
	type JsViewFieldDeclaration,
	type UnvalidatedViewFieldDeclaration,
	type ViewFieldDeclaration,
} from './ViewFieldDeclaration';
import { ViewFieldDeclarationValidator } from './ViewFieldDeclarationValidator';
import { ViewFieldArgumentContainer } from '../../fieldArguments/viewFieldArguments/ViewFieldArgumentContainer';
import { ViewFieldType } from '../GeneralConfigs';
import { runParser } from '../ParsingError';

export class ViewFieldDeclarationParser {
	plugin: IPlugin;

	constructor(plugin: IPlugin) {
		this.plugin = plugin;
	}

	parseString(fullDeclaration: string, scope?: BindTargetScope | undefined): ViewFieldDeclaration {
		const errorCollection = new ErrorCollection('ViewFieldDeclaration');

		try {
			const parserResult = runParser(
				VIEW_FIELD_FULL_DECLARATION,
				fullDeclaration,
			) as UnvalidatedViewFieldDeclaration;
			parserResult.fullDeclaration = fullDeclaration;
			parserResult.errorCollection = errorCollection;
			parserResult.arguments = [...parserResult.arguments]; // copy argument array to avoid modifying the original

			return this.validateDeclaration(parserResult, scope);
		} catch (e) {
			errorCollection.add(e);
		}

		return {
			fullDeclaration: fullDeclaration,
			errorCollection: errorCollection,
			templateDeclaration: [],
			viewFieldType: ViewFieldType.INVALID,
			argumentContainer: new ViewFieldArgumentContainer(),
			writeToBindTarget: undefined,
		};
	}

	parseStringWithoutValidation(fullDeclaration: string): UnvalidatedViewFieldDeclaration {
		const errorCollection = new ErrorCollection('ViewFieldDeclaration');

		try {
			const parserResult = runParser(
				VIEW_FIELD_FULL_DECLARATION,
				fullDeclaration,
			) as UnvalidatedViewFieldDeclaration;
			parserResult.fullDeclaration = fullDeclaration;
			parserResult.errorCollection = errorCollection;
			parserResult.arguments = [...parserResult.arguments]; // copy argument array to avoid modifying the original

			return parserResult;
		} catch (e) {
			errorCollection.add(e);
		}

		return {
			fullDeclaration: fullDeclaration,
			errorCollection: errorCollection,
			viewFieldType: { value: ViewFieldType.INVALID },
			writeToBindTarget: undefined,
			arguments: [],
			templateDeclaration: [],
		};
	}

	validateDeclaration(
		unvalidatedDeclaration: UnvalidatedViewFieldDeclaration,
		scope?: BindTargetScope | undefined,
	): ViewFieldDeclaration {
		const validator = new ViewFieldDeclarationValidator(unvalidatedDeclaration, this.plugin);

		return validator.validate(scope);
	}

	parseJsString(fullDeclaration: string): JsViewFieldDeclaration {
		const declaration: JsViewFieldDeclaration = {} as JsViewFieldDeclaration;
		declaration.errorCollection = new ErrorCollection('JsViewFieldDeclaration');

		declaration.fullDeclaration = fullDeclaration;

		try {
			const unvalidatedDeclaration = runParser(JS_VIEW_FIELD_DECLARATION, fullDeclaration);
			declaration.bindTargetMappings = unvalidatedDeclaration.bindTargetMappings.map(x => {
				return {
					bindTarget: this.plugin.api.bindTargetParser.validateBindTarget(fullDeclaration, x.bindTarget),
					name: x.name,
				};
			});
			declaration.code = unvalidatedDeclaration.code;
		} catch (e) {
			declaration.errorCollection.add(e);
		}

		return declaration;
	}
}

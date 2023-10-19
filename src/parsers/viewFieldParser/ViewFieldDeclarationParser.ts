import { ErrorCollection } from '../../utils/errors/ErrorCollection';
import { JS_VIEW_FIELD_DECLARATION, VIEW_FIELD_FULL_DECLARATION } from '../nomParsers/ViewFieldParsers';
import { IPlugin } from '../../IPlugin';
import { BindTargetScope } from '../../metadata/BindTargetScope';
import { JsViewFieldDeclaration, UnvalidatedViewFieldDeclaration, ViewFieldDeclaration } from './ViewFieldDeclaration';
import { ViewFieldDeclarationValidator } from './ViewFieldDeclarationValidator';
import { ViewFieldType } from './ViewFieldConfigs';
import { ViewFieldArgumentContainer } from '../../fieldArguments/viewFieldArguments/ViewFieldArgumentContainer';

export class ViewFieldDeclarationParser {
	plugin: IPlugin;

	constructor(plugin: IPlugin) {
		this.plugin = plugin;
	}

	parseString(fullDeclaration: string, scope?: BindTargetScope | undefined): ViewFieldDeclaration {
		const errorCollection = new ErrorCollection('ViewFieldDeclaration');

		try {
			const parserResult = VIEW_FIELD_FULL_DECLARATION.parse(fullDeclaration) as UnvalidatedViewFieldDeclaration;
			parserResult.fullDeclaration = fullDeclaration;
			parserResult.errorCollection = errorCollection;

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
			const parserResult = VIEW_FIELD_FULL_DECLARATION.parse(fullDeclaration) as UnvalidatedViewFieldDeclaration;
			parserResult.fullDeclaration = fullDeclaration;
			parserResult.errorCollection = errorCollection;

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

	validateDeclaration(unvalidatedDeclaration: UnvalidatedViewFieldDeclaration, scope?: BindTargetScope | undefined): ViewFieldDeclaration {
		const validator = new ViewFieldDeclarationValidator(unvalidatedDeclaration, this.plugin);

		return validator.validate(scope);
	}

	parseJsString(fullDeclaration: string): JsViewFieldDeclaration {
		const declaration: JsViewFieldDeclaration = {} as JsViewFieldDeclaration;
		declaration.errorCollection = new ErrorCollection('JsViewFieldDeclaration');

		declaration.fullDeclaration = fullDeclaration;

		try {
			const unvalidatedDeclaration = JS_VIEW_FIELD_DECLARATION.parse(fullDeclaration);
			declaration.bindTargetMappings = unvalidatedDeclaration.bindTargetMappings.map(x => {
				return {
					bindTarget: this.plugin.api.bindTargetParser.validateBindTarget(fullDeclaration, x.bindTarget),
					listenToChildren: x.listenToChildren,
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

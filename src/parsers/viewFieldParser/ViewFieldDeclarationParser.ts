import { ErrorCollection } from '../../utils/errors/ErrorCollection';
import { JS_VIEW_FIELD_DECLARATION, VIEW_FIELD_FULL_DECLARATION } from '../nomParsers/ViewFieldParsers';
import { IPlugin } from '../../IPlugin';
import { UnvalidatedBindTargetDeclaration } from '../inputFieldParser/InputFieldDeclaration';
import { BindTargetScope } from '../../metadata/BindTargetScope';
import { JsViewFieldDeclaration, UnvalidatedViewFieldDeclaration, ViewFieldDeclaration } from './ViewFieldDeclaration';

export class ViewFieldDeclarationParser {
	plugin: IPlugin;

	constructor(plugin: IPlugin) {
		this.plugin = plugin;
	}

	parseString(fullDeclaration: string, scope?: BindTargetScope | undefined): ViewFieldDeclaration {
		const declaration: ViewFieldDeclaration = {} as ViewFieldDeclaration;
		declaration.fullDeclaration = fullDeclaration;
		declaration.errorCollection = new ErrorCollection('ViewFieldDeclaration');

		try {
			const parserResult = VIEW_FIELD_FULL_DECLARATION.parse(fullDeclaration) as (string | UnvalidatedBindTargetDeclaration)[];
			declaration.declaration = parserResult.map(x => {
				if (typeof x === 'string') {
					return x;
				} else {
					return this.plugin.api.bindTargetParser.validateBindTarget(fullDeclaration, x, scope);
				}
			});
		} catch (e) {
			declaration.errorCollection.add(e);
		}

		return declaration;
	}

	parseStringWithoutValidation(fullDeclaration: string): UnvalidatedViewFieldDeclaration {
		const declaration: UnvalidatedViewFieldDeclaration = {} as UnvalidatedViewFieldDeclaration;
		declaration.fullDeclaration = fullDeclaration;
		declaration.errorCollection = new ErrorCollection('ViewFieldDeclaration');

		try {
			declaration.templateDeclaration = VIEW_FIELD_FULL_DECLARATION.parse(fullDeclaration) as (string | UnvalidatedBindTargetDeclaration)[];
		} catch (e) {
			declaration.errorCollection.add(e);
		}

		return declaration;
	}

	validateDeclaration(unvalidatedDeclaration: UnvalidatedViewFieldDeclaration, scope?: BindTargetScope | undefined): ViewFieldDeclaration {
		const declaration: ViewFieldDeclaration = {} as ViewFieldDeclaration;
		declaration.fullDeclaration = unvalidatedDeclaration.fullDeclaration;
		declaration.errorCollection = unvalidatedDeclaration.errorCollection;

		try {
			declaration.declaration =
				unvalidatedDeclaration.templateDeclaration?.map(x => {
					if (typeof x === 'string') {
						return x;
					} else {
						return this.plugin.api.bindTargetParser.validateBindTarget(declaration.fullDeclaration ?? '', x, scope);
					}
				}) ?? [];
		} catch (e) {
			declaration.errorCollection.add(e);
		}

		return declaration;
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

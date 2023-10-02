import { ParserUtils } from '../utils/ParserUtils';
import { ErrorLevel, MetaBindParsingError } from '../utils/errors/MetaBindErrors';
import { ErrorCollection } from '../utils/errors/ErrorCollection';
import { JS_VIEW_FIELD_DECLARATION, VIEW_FIELD_FULL_DECLARATION } from './nomParsers/Parsers';
import { IPlugin } from '../IPlugin';
import { BindTargetDeclaration, UnvalidatedBindTargetDeclaration } from './newInputFieldParser/InputFieldDeclaration';
import { BindTargetParser } from './BindTargetParser';

export enum ViewFieldType {
	MATH = 'math',
	JS = 'js',

	INVALID = 'invalid',
}

export interface ViewFieldDeclaration {
	/**
	 * The full declaration of the view field including the "VIEW[]".
	 * e.g.
	 * VIEW[{x} * 2]
	 */
	fullDeclaration?: string;
	/**
	 * Declaration array.
	 */
	declaration?: (string | BindTargetDeclaration)[];

	errorCollection: ErrorCollection;
}

export interface UnvalidatedJsViewFieldBindTargetMapping {
	bindTarget: UnvalidatedBindTargetDeclaration;
	listenToChildren: boolean;
	name: string;
}

export interface UnvalidatedJsViewFieldDeclaration {
	bindTargetMappings: UnvalidatedJsViewFieldBindTargetMapping[];
	code: string;
}

export interface JsViewFieldBindTargetMapping {
	bindTarget: BindTargetDeclaration;
	listenToChildren: boolean;
	name: string;
}

export interface JsViewFieldDeclaration {
	fullDeclaration: string;

	bindTargetMappings: JsViewFieldBindTargetMapping[];
	code: string;

	errorCollection: ErrorCollection;
}

export class ViewFieldDeclarationParser {
	plugin: IPlugin;

	constructor(plugin: IPlugin) {
		this.plugin = plugin;
	}

	parseString(fullDeclaration: string): ViewFieldDeclaration {
		const declaration: ViewFieldDeclaration = {} as ViewFieldDeclaration;
		declaration.fullDeclaration = fullDeclaration;
		declaration.errorCollection = new ErrorCollection('ViewFieldDeclaration');

		try {
			const parserResult = VIEW_FIELD_FULL_DECLARATION.parse(fullDeclaration) as (string | UnvalidatedBindTargetDeclaration)[];
			declaration.declaration = parserResult.map(x => {
				if (typeof x === 'string') {
					return x;
				} else {
					return this.plugin.api.bindTargetParser.validateBindTarget(fullDeclaration, x);
				}
			});
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

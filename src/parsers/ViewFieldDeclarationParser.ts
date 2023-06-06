import { EnclosingPair, ParserUtils } from '../utils/ParserUtils';
import { ErrorLevel, MetaBindParsingError } from '../utils/errors/MetaBindErrors';
import { ErrorCollection } from '../utils/errors/ErrorCollection';

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
	 * Trimmed declaration of the view field including without the "VIEW[]".
	 * e.g.
	 * {x} * 2
	 */
	declaration?: string;
	/**
	 * The bind targets, so all variables used in the view field.
	 * e.g.
	 * x
	 */
	bindTargets?: string[];

	errorCollection: ErrorCollection;
}

export interface JsViewFieldDeclaration {
	/**
	 * The full declaration of the view field.
	 */
	fullDeclaration?: string;
	code?: string;
	variables?: string;
	bindTargets?: { bindTarget: string; name: string }[];

	errorCollection: ErrorCollection;
}

export class ViewFieldDeclarationParser {
	roundBracesPair: EnclosingPair = new EnclosingPair('(', ')');
	squareBracesPair: EnclosingPair = new EnclosingPair('[', ']');
	curlyBracesPair: EnclosingPair = new EnclosingPair('{', '}');
	allBracesPairs: EnclosingPair[] = [this.roundBracesPair, this.squareBracesPair, this.curlyBracesPair];

	parseString(fullDeclaration: string): ViewFieldDeclaration {
		const declaration: ViewFieldDeclaration = {} as ViewFieldDeclaration;

		try {
			// declaration
			declaration.fullDeclaration = fullDeclaration;
			const temp = ParserUtils.getInBetween(fullDeclaration, this.squareBracesPair);
			if (Array.isArray(temp)) {
				throw new MetaBindParsingError(ErrorLevel.CRITICAL, 'invalid view field declaration', 'expected exactly one square braces pair');
			} else {
				declaration.declaration = temp;
			}

			// variables
			const variables = ParserUtils.getInBetween(declaration.declaration, this.curlyBracesPair);
			if (Array.isArray(variables)) {
				declaration.bindTargets = variables;
			} else {
				declaration.bindTargets = [variables];
			}
		} catch (e) {
			declaration.errorCollection.add(e);
		}

		return declaration;
	}

	parseJsString(fullDeclaration: string): JsViewFieldDeclaration {
		const declaration: JsViewFieldDeclaration = {} as JsViewFieldDeclaration;
		declaration.errorCollection = new ErrorCollection('JsViewFieldDeclaration');

		try {
			// declaration
			declaration.fullDeclaration = fullDeclaration;
			const declarationParts = ParserUtils.split(declaration.fullDeclaration, '\n---\n');
			if (declarationParts.length === 1) {
				throw new MetaBindParsingError(ErrorLevel.CRITICAL, 'failed to parse view field declaration', 'missing "---"');
			} else {
				declaration.variables = declarationParts[0];
				declaration.code = declarationParts.slice(1).join('\n---\n');
			}

			// variables
			const variableLines = ParserUtils.split(declaration.variables, '\n');
			declaration.bindTargets = [];
			for (const variableLine of variableLines) {
				const variableLineParts = ParserUtils.split(variableLine, ' as ');
				if (variableLineParts.length !== 2) {
					throw new MetaBindParsingError(ErrorLevel.CRITICAL, 'failed to parse variable', 'expected variable to include exactly one " as "');
				}

				let bindTarget = variableLineParts[0].trim();
				if (bindTarget.startsWith('{') && bindTarget.endsWith('}')) {
					bindTarget = bindTarget.substring(1, bindTarget.length - 1);
				} else {
					throw new MetaBindParsingError(ErrorLevel.CRITICAL, 'failed to parse variable', 'expected bind target to be wrapped with "{}"');
				}

				if (!this.isValidVariableName(variableLineParts[1])) {
					throw new MetaBindParsingError(ErrorLevel.CRITICAL, 'failed to parse variable', 'invalid variable name');
				}

				declaration.bindTargets.push({
					bindTarget: bindTarget,
					name: variableLineParts[1],
				});
			}
		} catch (e) {
			declaration.errorCollection.add(e);
		}

		return declaration;
	}

	isValidVariableName(varName: string): boolean {
		if (!varName) {
			throw new MetaBindParsingError(ErrorLevel.WARNING, 'failed to parse variable', 'variable name can not be empty');
		}

		if (varName.contains(' ')) {
			throw new MetaBindParsingError(ErrorLevel.WARNING, 'failed to parse variable', 'variable name can not contain a space');
		}

		return true;

		// TODO: make this better
	}
}

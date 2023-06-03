import { EnclosingPair, ParserUtils } from '../utils/ParserUtils';
import { MetaBindParsingError } from '../utils/MetaBindErrors';

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

	error?: Error | string;
}

export interface JsViewFieldDeclaration {
	/**
	 * The full declaration of the view field.
	 */
	fullDeclaration?: string;
	code?: string;
	variables?: string;
	bindTargets?: { bindTarget: string; name: string }[];

	error?: Error | string;
}

export class ViewFieldDeclarationParser {
	roundBracesPair: EnclosingPair = new EnclosingPair('(', ')');
	squareBracesPair: EnclosingPair = new EnclosingPair('[', ']');
	curlyBracesPair: EnclosingPair = new EnclosingPair('{', '}');
	allBracesPairs: EnclosingPair[] = [this.roundBracesPair, this.squareBracesPair, this.curlyBracesPair];

	parseString(fullDeclaration: string): ViewFieldDeclaration {
		const viewFieldDeclaration: ViewFieldDeclaration = {} as ViewFieldDeclaration;

		try {
			// declaration
			viewFieldDeclaration.fullDeclaration = fullDeclaration;
			const temp = ParserUtils.getInBetween(fullDeclaration, this.squareBracesPair);
			if (Array.isArray(temp)) {
				throw new MetaBindParsingError('invalid view field declaration');
			} else {
				viewFieldDeclaration.declaration = temp;
			}

			// variables
			const variables = ParserUtils.getInBetween(viewFieldDeclaration.declaration, this.curlyBracesPair);
			if (Array.isArray(variables)) {
				viewFieldDeclaration.bindTargets = variables;
			} else {
				viewFieldDeclaration.bindTargets = [variables];
			}
		} catch (e) {
			if (e instanceof Error) {
				viewFieldDeclaration.error = e;
				console.warn(e);
			}
		}

		return viewFieldDeclaration;
	}

	parseJsString(fullDeclaration: string): JsViewFieldDeclaration {
		const jsViewFieldDeclaration: JsViewFieldDeclaration = {} as JsViewFieldDeclaration;

		try {
			// declaration
			jsViewFieldDeclaration.fullDeclaration = fullDeclaration;
			const declarationParts = ParserUtils.split(jsViewFieldDeclaration.fullDeclaration, '\n---\n');
			if (declarationParts.length === 1) {
				throw new MetaBindParsingError('invalid view field declaration');
			} else {
				jsViewFieldDeclaration.variables = declarationParts[0];
				jsViewFieldDeclaration.code = declarationParts.slice(1).join('\n---\n');
			}

			// variables
			const variableLines = ParserUtils.split(jsViewFieldDeclaration.variables, '\n');
			jsViewFieldDeclaration.bindTargets = [];
			for (const variableLine of variableLines) {
				const variableLineParts = ParserUtils.split(variableLine, ' as ');
				if (variableLineParts.length !== 2) {
					throw new MetaBindParsingError('invalid view field declaration');
				}

				let bindTarget = variableLineParts[0].trim();
				if (bindTarget.startsWith('{') && bindTarget.endsWith('}')) {
					bindTarget = bindTarget.substring(1, bindTarget.length - 1);
				} else {
					throw new MetaBindParsingError('invalid view field declaration');
				}

				if (!this.isValidVariableName(variableLineParts[1])) {
					throw new MetaBindParsingError('invalid view field declaration');
				}

				jsViewFieldDeclaration.bindTargets.push({
					bindTarget: bindTarget,
					name: variableLineParts[1],
				});
			}
		} catch (e) {
			if (e instanceof Error) {
				jsViewFieldDeclaration.error = e;
				console.warn(e);
			}
		}

		return jsViewFieldDeclaration;
	}

	isValidVariableName(varName: string): boolean {
		if (!varName) {
			throw new MetaBindParsingError('variable name can not be empty');
		}

		if (varName.contains(' ')) {
			throw new MetaBindParsingError('variable name can not contain a space');
		}

		return true;

		// TODO: make this better
	}
}

import {InputFieldArgumentContainer} from '../inputFieldArguments/InputFieldArgumentContainer';
import {InputFieldType} from './InputFieldDeclarationParser';
import {EnclosingPair, ParserUtils} from '../utils/ParserUtils';
import {MetaBindParsingError} from '../utils/MetaBindErrors';

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
}

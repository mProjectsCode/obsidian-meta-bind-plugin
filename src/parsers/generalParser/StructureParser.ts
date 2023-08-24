import { AbstractToken } from './ParsingUtils';
import { PT_Element } from './ParsingTree';
import { ValidationContextEntry } from './validationGraph/ValidationGraph';

export interface StructureParserResult<TokenType extends string, Token extends AbstractToken<TokenType>> {
	result: string;
	ptElement?: PT_Element<TokenType, Token>;
}

export function getTrimmedStructureParserResult<TokenType extends string, Token extends AbstractToken<TokenType>, Element extends PT_Element<TokenType, Token>>(
	validationContextEntry: ValidationContextEntry<TokenType, Token, Element>
): StructureParserResult<TokenType, Token>;
export function getTrimmedStructureParserResult(validationContextEntry: undefined): undefined;
export function getTrimmedStructureParserResult<TokenType extends string, Token extends AbstractToken<TokenType>, Element extends PT_Element<TokenType, Token>>(
	validationContextEntry: ValidationContextEntry<TokenType, Token, Element> | undefined
): StructureParserResult<TokenType, Token> | undefined;
export function getTrimmedStructureParserResult<TokenType extends string, Token extends AbstractToken<TokenType>, Element extends PT_Element<TokenType, Token>>(
	validationContextEntry: ValidationContextEntry<TokenType, Token, Element> | undefined
): StructureParserResult<TokenType, Token> | undefined {
	if (!validationContextEntry) {
		return undefined;
	}
	return {
		result: validationContextEntry.element.toLiteral().trim(),
		ptElement: validationContextEntry.element,
	};
}

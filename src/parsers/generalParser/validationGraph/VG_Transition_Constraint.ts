import { PT_Element, PT_Element_Type } from '../ParsingTree';
import { AbstractToken } from '../ParsingUtils';

export class VG_Transition_Constraint<TokenType extends string, Token extends AbstractToken<TokenType>> {
	readonly astType: PT_Element_Type;
	readonly tokenType: TokenType | undefined;
	readonly literalContent: string | undefined;

	constructor(astType: PT_Element_Type, tokenType?: TokenType | undefined, literalContent?: string | undefined) {
		this.astType = astType;
		this.tokenType = tokenType;
		this.literalContent = literalContent;
	}

	public canTransition(astEl: PT_Element<TokenType, Token> | undefined): boolean {
		if (astEl === undefined) {
			return false;
		}

		if (astEl.type !== this.astType) {
			return false;
		}

		if (this.tokenType !== undefined && astEl.getToken().type !== this.tokenType) {
			return false;
		}

		if (this.literalContent !== undefined && astEl.toLiteral() !== this.literalContent) {
			return false;
		}

		return true;
	}

	public isEqual(other: VG_Transition_Constraint<TokenType, Token>): boolean {
		return this.astType === other.astType && this.tokenType === other.tokenType && this.literalContent === other.literalContent;
	}

	public toString(): string {
		if (this.tokenType !== undefined && this.literalContent !== undefined) {
			return `${this.astType}, "${this.tokenType}", "${this.literalContent}"`;
		}

		if (this.tokenType !== undefined) {
			return `${this.astType}, "${this.tokenType}"`;
		}

		if (this.literalContent !== undefined) {
			return `${this.astType}, "${this.literalContent}"`;
		}

		return this.astType;
	}
}

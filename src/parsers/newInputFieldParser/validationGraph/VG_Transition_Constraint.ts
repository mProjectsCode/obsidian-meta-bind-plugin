import { InputFieldTokenType } from '../InputFieldTokenizer';
import { PT_Element, PT_Element_Type } from '../ParsingTree';

export class VG_Transition_Constraint {
	readonly astType: PT_Element_Type;
	readonly tokenType: InputFieldTokenType | undefined;
	readonly literalContent: string | undefined;

	constructor(astType: PT_Element_Type, tokenType?: InputFieldTokenType | undefined, literalContent?: string | undefined) {
		this.astType = astType;
		this.tokenType = tokenType;
		this.literalContent = literalContent;
	}

	public canTransition(astEl: PT_Element | undefined): boolean {
		if (astEl === undefined) {
			return false;
		}

		if (astEl.type !== this.astType) {
			// return new ParsingError(
			// 	ErrorLevel.ERROR,
			// 	'failed to parse',
			// 	`Encountered invalid token. Expected token to be of type '${this.astType}' but received '${astEl.type}'.`,
			// 	{},
			// 	astEl.str,
			// 	astEl.getToken(),
			// 	'Validation Graph'
			// );
			return false;
		}

		if (this.tokenType !== undefined && astEl.getToken().type !== this.tokenType) {
			// return new ParsingError(
			// 	ErrorLevel.ERROR,
			// 	'failed to parse',
			// 	`Encountered invalid token. Expected token to be '${this.tokenType}' but received '${astEl.getToken().type}'.`,
			// 	{},
			// 	astEl.str,
			// 	astEl.getToken(),
			// 	'Validation Graph'
			// );
			return false;
		}

		if (this.literalContent !== undefined && astEl.toLiteral() !== this.literalContent) {
			// return new ParsingError(
			// 	ErrorLevel.ERROR,
			// 	'failed to parse',
			// 	`Encountered invalid token. Expected token to contain literal '${this.literalContent}' but received '${astEl.toLiteral()}'.`,
			// 	{},
			// 	astEl.str,
			// 	astEl.getToken(),
			// 	'Validation Graph'
			// );
			return false;
		}

		return true;
	}

	public isEqual(other: VG_Transition_Constraint): boolean {
		return this.astType === other.astType && this.tokenType === other.tokenType && this.literalContent === other.literalContent;
	}

	public toString(): string {
		if (this.tokenType !== undefined && this.literalContent !== undefined) {
			return `${this.astType}, ${this.tokenType}, ${this.literalContent}`;
		}

		if (this.tokenType !== undefined) {
			return `${this.astType}, ${this.tokenType}`;
		}

		if (this.literalContent !== undefined) {
			return `${this.astType}, ${this.literalContent}`;
		}

		return this.astType;
	}
}

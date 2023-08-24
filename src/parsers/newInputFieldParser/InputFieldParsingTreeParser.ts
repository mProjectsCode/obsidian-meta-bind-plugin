import { InputFieldClosures, InputFieldToken, InputFieldTokenType } from './InputFieldTokenizer';
import { ParsingTreeParser } from '../generalParser/ParsingTreeParser';

export class InputFieldParsingTreeParser extends ParsingTreeParser<InputFieldTokenType, InputFieldToken> {
	constructor(str: string, tokens: InputFieldToken[]) {
		super(str, tokens, InputFieldClosures);
	}
}

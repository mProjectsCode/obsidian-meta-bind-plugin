import { ParsingError } from './ParsingError';
import { ErrorLevel } from '../../utils/errors/MetaBindErrors';
import { ParsingTree, PT_Closure, PT_Element, PT_Element_Type, PT_Literal } from './ParsingTree';
import { Closure } from './ParsingUtils';
import { InputFieldClosures, InputFieldToken, InputFieldTokenType } from './InputFieldTokenizer';

export class InputFieldParsingTreeParser {
	private readonly tokens: InputFieldToken[];
	private readonly closureStack: Closure<InputFieldTokenType>[];
	private readonly parsingTree: ParsingTree;
	private position: number;

	constructor(str: string, tokens: InputFieldToken[]) {
		this.tokens = tokens;
		this.position = 0;
		this.closureStack = [];
		this.parsingTree = new ParsingTree(str, tokens);
	}

	public parse(): ParsingTree {
		while (this.getCurrentToken().type !== InputFieldTokenType.EOF) {
			const astel = this.parseCurrentToken();
			this.parsingTree.children.push(astel);

			if (this.position >= this.tokens.length) {
				throw new Error('index to big');
			}
		}

		return this.parsingTree;
	}

	private parseCurrentToken(): PT_Element {
		const token = this.getCurrentToken();

		this.throwOnInvalidToken();

		const ptLiteral = new PT_Literal(token, this.parsingTree.str);

		for (const closure of InputFieldClosures) {
			const ptClosure = this.parseClosure(ptLiteral, closure);
			if (ptClosure) {
				return ptClosure;
			}
		}

		// move the position to the next token
		this.position += 1;

		return ptLiteral;
	}

	private parseClosure(openingLiteral: PT_Literal, closure: Closure<InputFieldTokenType>): PT_Element | undefined {
		if (openingLiteral.token.type !== closure.openingTokenType) {
			return undefined;
		}

		this.closureStack.push(closure);

		let closingLiteral: PT_Literal | undefined;
		const children: PT_Element[] = [];

		// skip the opening token
		this.position += 1;

		while (this.getCurrentToken().type !== InputFieldTokenType.EOF) {
			const nestedRes = this.parseCurrentToken();

			if (nestedRes.type === PT_Element_Type.LITERAL && (nestedRes as PT_Literal).token.type === closure.closingTokenType) {
				closingLiteral = nestedRes as PT_Literal;
				break;
			} else {
				children.push(nestedRes);
			}
		}

		if (!closingLiteral) {
			// ERROR
			throw new ParsingError(ErrorLevel.ERROR, 'failed to parse', 'closure was not closed', {}, this.parsingTree.str, openingLiteral.token, 'PT Parser');
		}

		this.closureStack.pop();

		return new PT_Closure(this.parsingTree.str, openingLiteral, closingLiteral, children);
	}

	private getCurrentToken(): InputFieldToken {
		return this.tokens[this.position];
	}

	throwOnInvalidToken(): void {
		const token = this.getCurrentToken();

		// check for closure closing tokens that do not actually close a closure
		const currentClosure = this.closureStack.length > 0 ? this.closureStack[this.closureStack.length - 1] : undefined;

		for (const closure of InputFieldClosures) {
			// if the closure is the current token
			if (
				currentClosure &&
				closure.openingTokenType === currentClosure.openingTokenType &&
				closure.closingTokenType === currentClosure.closingTokenType
			) {
				continue;
			}

			// if the current token is a closing token of a closure that is not the active closure
			if (token.type === closure.closingTokenType) {
				throw new ParsingError(
					ErrorLevel.ERROR,
					'failed to parse',
					'Encountered invalid token. Active closure is not the closure that this token closes.',
					{},
					this.parsingTree.str,
					token,
					'PT Parser'
				);
			}
		}
	}
}

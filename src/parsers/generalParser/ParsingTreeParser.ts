import { ParsingError } from './ParsingError';
import { ErrorLevel } from '../../utils/errors/MetaBindErrors';
import { ParsingTree, PT_Closure, PT_Element, PT_Element_Type, PT_Literal } from './ParsingTree';
import { AbstractToken, Closure, EOF_TOKEN } from './ParsingUtils';

export class ParsingTreeParser<TokenType extends string, Token extends AbstractToken<TokenType>> {
	private readonly tokens: Token[];
	private readonly closureStack: Closure<TokenType>[];
	private readonly parsingTree: ParsingTree<TokenType, Token>;
	private readonly closures: Closure<TokenType>[];
	private position: number;

	constructor(str: string, tokens: Token[], closures: Closure<TokenType>[]) {
		this.tokens = tokens;
		this.closures = closures;
		this.position = 0;
		this.closureStack = [];
		this.parsingTree = new ParsingTree(str, tokens);
	}

	public parse(): ParsingTree<TokenType, Token> {
		while (this.getCurrentToken().type !== EOF_TOKEN) {
			const astel = this.parseCurrentToken();
			this.parsingTree.children.push(astel);

			if (this.position >= this.tokens.length) {
				throw new Error('index to big');
			}
		}

		return this.parsingTree;
	}

	private parseCurrentToken(): PT_Element<TokenType, Token> {
		const token = this.getCurrentToken();

		this.throwOnInvalidToken();

		const ptLiteral = new PT_Literal(token, this.parsingTree.str);

		for (const closure of this.closures) {
			const ptClosure = this.parseClosure(ptLiteral, closure);
			if (ptClosure) {
				return ptClosure;
			}
		}

		// move the position to the next token
		this.position += 1;

		return ptLiteral;
	}

	private parseClosure(openingLiteral: PT_Literal<TokenType, Token>, closure: Closure<TokenType>): PT_Element<TokenType, Token> | undefined {
		if (openingLiteral.token.type !== closure.openingTokenType) {
			return undefined;
		}

		this.closureStack.push(closure);

		let closingLiteral: PT_Literal<TokenType, Token> | undefined;
		const children: PT_Element<TokenType, Token>[] = [];

		// skip the opening token
		this.position += 1;

		while (this.getCurrentToken().type !== EOF_TOKEN) {
			const nestedRes = this.parseCurrentToken();

			if (nestedRes.type === PT_Element_Type.LITERAL && (nestedRes as PT_Literal<TokenType, Token>).token.type === closure.closingTokenType) {
				closingLiteral = nestedRes as PT_Literal<TokenType, Token>;
				break;
			} else {
				children.push(nestedRes);
			}
		}

		if (!closingLiteral) {
			throw new ParsingError(
				ErrorLevel.ERROR,
				'failed to parse',
				`Closure was not closed. You forgot a '${closure.closingTokenType}'.`,
				{},
				this.parsingTree.str,
				openingLiteral.token,
				'PT Parser'
			);
		}

		this.closureStack.pop();

		return new PT_Closure(this.parsingTree.str, openingLiteral, closingLiteral, children);
	}

	private getCurrentToken(): Token {
		return this.tokens[this.position];
	}

	throwOnInvalidToken(): void {
		const token = this.getCurrentToken();

		// check for closure closing tokens that do not actually close a closure
		const currentClosure = this.closureStack.length > 0 ? this.closureStack[this.closureStack.length - 1] : undefined;

		for (const closure of this.closures) {
			// if the closure is the current token
			if (
				currentClosure !== undefined &&
				closure.openingTokenType === currentClosure.openingTokenType &&
				closure.closingTokenType === currentClosure.closingTokenType
			) {
				continue;
			}

			// if the current token is a closing token of a closure that is not the active closure
			if (token.type === closure.closingTokenType) {
				if (currentClosure !== undefined) {
					throw new ParsingError(
						ErrorLevel.ERROR,
						'failed to parse',
						`Encountered invalid token. Active closure is not the closure that this token closes. You probably forgot a '${currentClosure.closingTokenType}' somewhere in font of this token.`,
						{},
						this.parsingTree.str,
						token,
						'PT Parser'
					);
				} else {
					throw new ParsingError(
						ErrorLevel.ERROR,
						'failed to parse',
						`Encountered invalid token. Active closure is not the closure that this token closes. You probably forgot a '${closure.openingTokenType} somewhere in font of this token.'`,
						{},
						this.parsingTree.str,
						token,
						'PT Parser'
					);
				}
			}
		}
	}
}

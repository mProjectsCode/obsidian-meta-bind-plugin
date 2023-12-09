import { type ParsingPosition, type ParsingRange } from '@lemons_dev/parsinom/lib/HelperTypes';
import { ParsingError, runParser } from '../parsers/ParsingError';
import {
	BIND_TARGET_HLP,
	INLINE_BUTTON_DECLARATION_HLP,
	INPUT_FIELD_DECLARATION_HLP,
	VIEW_FIELD_DECLARATION_HLP,
} from '../parsers/HLPUtils';
import { InlineMDRCType } from '../utils/InlineMDRCUtils';
import { type IPlugin } from '../IPlugin';
import { type IAPI } from './IAPI';
import { P_UTILS } from '@lemons_dev/parsinom/lib/ParserUtils';
import { type Parser } from '@lemons_dev/parsinom/lib/Parser';

export class Highlight {
	range: ParsingRange;
	tokenClass: string;

	constructor(range: ParsingRange, tokenClass: string) {
		this.range = range;
		this.tokenClass = tokenClass;
	}
}

export class SyntaxHighlighting {
	str: string;
	highlights: Highlight[];
	parsingError?: ParsingError;

	constructor(str: string, highlights: Highlight[], parsingError?: ParsingError) {
		this.str = str;
		this.highlights = highlights.filter(x => x.range.from.index !== x.range.to.index);
		this.parsingError = parsingError;
	}

	getHighlights(): Highlight[] {
		if (this.parsingError === undefined) {
			return this.highlights;
		}

		let errorTo: ParsingPosition;

		if (this.str[this.parsingError.parseFailure.furthest.index] === '\n') {
			errorTo = {
				index: this.parsingError.parseFailure.furthest.index + 1,
				column: 1,
				line: this.parsingError.parseFailure.furthest.line + 1,
			};
		} else {
			errorTo = {
				index: this.parsingError.parseFailure.furthest.index + 1,
				column: this.parsingError.parseFailure.furthest.column + 1,
				line: this.parsingError.parseFailure.furthest.line,
			};
		}

		return [
			new Highlight(
				{
					from: this.parsingError.parseFailure.furthest,
					to: errorTo,
				},
				'error',
			),
		];
	}
}

export class SyntaxHighlightingAPI {
	public readonly api: IAPI;
	public readonly plugin: IPlugin;

	constructor(plugin: IPlugin) {
		this.plugin = plugin;
		this.api = plugin.api;
	}

	highlightInputFieldDeclaration(str: string, trimWhiteSpace: boolean): SyntaxHighlighting {
		return this.highlightWithParser(str, trimWhiteSpace, INPUT_FIELD_DECLARATION_HLP);
	}

	highlightViewFieldDeclaration(str: string, trimWhiteSpace: boolean): SyntaxHighlighting {
		return this.highlightWithParser(str, trimWhiteSpace, VIEW_FIELD_DECLARATION_HLP);
	}

	highlightInlineButtonDeclaration(str: string, trimWhiteSpace: boolean): SyntaxHighlighting {
		return this.highlightWithParser(str, trimWhiteSpace, INLINE_BUTTON_DECLARATION_HLP);
	}

	highlight(str: string, mdrcType: InlineMDRCType, trimWhiteSpace: boolean): SyntaxHighlighting {
		if (mdrcType === InlineMDRCType.INPUT_FIELD) {
			return this.highlightInputFieldDeclaration(str, trimWhiteSpace);
		} else if (mdrcType === InlineMDRCType.VIEW_FIELD) {
			return this.highlightViewFieldDeclaration(str, trimWhiteSpace);
		} else if (mdrcType === InlineMDRCType.BUTTON) {
			return this.highlightInlineButtonDeclaration(str, trimWhiteSpace);
		}

		throw new Error(`Unknown MDRCType ${mdrcType}`);
	}

	highlightBindTarget(str: string, trimWhiteSpace: boolean): SyntaxHighlighting {
		return this.highlightWithParser(str, trimWhiteSpace, BIND_TARGET_HLP);
	}

	private highlightWithParser(str: string, trimWhiteSpace: boolean, parser: Parser<Highlight[]>): SyntaxHighlighting {
		try {
			if (trimWhiteSpace) {
				return new SyntaxHighlighting(str, runParser(parser.trim(P_UTILS.optionalWhitespace()).thenEof(), str));
			} else {
				return new SyntaxHighlighting(str, runParser(parser.thenEof(), str));
			}
		} catch (e) {
			if (e instanceof ParsingError) {
				return new SyntaxHighlighting(str, [], e);
			} else {
				console.error(e);
				return new SyntaxHighlighting(str, []);
			}
		}
	}
}

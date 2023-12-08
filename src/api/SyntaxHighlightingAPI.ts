import { type ParsingRange } from '@lemons_dev/parsinom/lib/HelperTypes';
import { type API } from './API';
import type MetaBindPlugin from '../main';
import { ParsingError, runParser } from '../parsers/ParsingError';
import {
	INLINE_BUTTON_DECLARATION_HLP,
	INPUT_FIELD_DECLARATION_HLP,
	VIEW_FIELD_DECLARATION_HLP,
} from '../parsers/HLPUtils';
import { InlineMDRCType } from '../utils/InlineMDRCUtils';

export class Highlight {
	range: ParsingRange;
	tokenClass: string;

	constructor(range: ParsingRange, tokenClass: string) {
		this.range = range;
		this.tokenClass = tokenClass;
	}
}

export class SyntaxHighlighting {
	highlights: Highlight[];
	parsingError?: ParsingError;

	constructor(highlights: Highlight[], parsingError?: ParsingError) {
		this.highlights = highlights;
		this.parsingError = parsingError;
	}

	getHighlights(): Highlight[] {
		if (this.parsingError === undefined) {
			return this.highlights.filter(x => x.range.from.index !== x.range.to.index);
		}

		return [
			new Highlight(
				{
					from: this.parsingError.parseFailure.furthest,
					to: {
						line: this.parsingError.parseFailure.furthest.line,
						column: this.parsingError.parseFailure.furthest.column + 1,
						index: this.parsingError.parseFailure.furthest.index + 1,
					},
				},
				'error',
			),
		];
	}
}

export class SyntaxHighlightingAPI {
	public readonly api: API;
	public readonly plugin: MetaBindPlugin;

	constructor(plugin: MetaBindPlugin) {
		this.plugin = plugin;
		this.api = plugin.api;
	}

	highlightInputFieldDeclaration(str: string): SyntaxHighlighting {
		try {
			return new SyntaxHighlighting(runParser(INPUT_FIELD_DECLARATION_HLP, str));
		} catch (e) {
			if (e instanceof ParsingError) {
				return new SyntaxHighlighting([], e);
			} else {
				console.error(e);
				return new SyntaxHighlighting([]);
			}
		}
	}

	highlightViewFieldDeclaration(str: string): SyntaxHighlighting {
		try {
			return new SyntaxHighlighting(runParser(VIEW_FIELD_DECLARATION_HLP, str));
		} catch (e) {
			if (e instanceof ParsingError) {
				return new SyntaxHighlighting([], e);
			} else {
				console.error(e);
				return new SyntaxHighlighting([]);
			}
		}
	}

	highlightInlineButtonDeclaration(str: string): SyntaxHighlighting {
		try {
			return new SyntaxHighlighting(runParser(INLINE_BUTTON_DECLARATION_HLP, str));
		} catch (e) {
			if (e instanceof ParsingError) {
				return new SyntaxHighlighting([], e);
			} else {
				console.error(e);
				return new SyntaxHighlighting([]);
			}
		}
	}

	highlight(str: string, mdrcType: InlineMDRCType): SyntaxHighlighting {
		if (mdrcType === InlineMDRCType.INPUT_FIELD) {
			return this.highlightInputFieldDeclaration(str);
		} else if (mdrcType === InlineMDRCType.VIEW_FIELD) {
			return this.highlightViewFieldDeclaration(str);
		} else if (mdrcType === InlineMDRCType.BUTTON) {
			return this.highlightInlineButtonDeclaration(str);
		}

		throw new Error(`Unknown MDRCType ${mdrcType}`);
	}
}

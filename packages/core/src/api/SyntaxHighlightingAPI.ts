import { ParsingError, runParser } from 'packages/core/src/parsers/ParsingError';
import { type IPlugin } from 'packages/core/src/IPlugin';
import { FieldType } from 'packages/core/src/api/API';
import { P_UTILS } from '@lemons_dev/parsinom/lib/ParserUtils';
import { type Parser } from '@lemons_dev/parsinom/lib/Parser';
import { SyntaxHighlighting } from 'packages/core/src/parsers/syntaxHighlighting/SyntaxHighlighting';
import { type Highlight } from 'packages/core/src/parsers/syntaxHighlighting/Highlight';
import {
	BIND_TARGET_HLP,
	INLINE_BUTTON_DECLARATION_HLP,
	INPUT_FIELD_DECLARATION_HLP,
	VIEW_FIELD_DECLARATION_HLP,
} from 'packages/core/src/parsers/syntaxHighlighting/HLPs';

export class SyntaxHighlightingAPI {
	public readonly plugin: IPlugin;

	constructor(plugin: IPlugin) {
		this.plugin = plugin;
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

	highlight(str: string, mdrcType: FieldType, trimWhiteSpace: boolean): SyntaxHighlighting {
		if (mdrcType === FieldType.INPUT_FIELD) {
			return this.highlightInputFieldDeclaration(str, trimWhiteSpace);
		} else if (mdrcType === FieldType.VIEW_FIELD) {
			return this.highlightViewFieldDeclaration(str, trimWhiteSpace);
		} else if (mdrcType === FieldType.INLINE_BUTTON) {
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

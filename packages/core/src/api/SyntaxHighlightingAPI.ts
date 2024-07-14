import type { Parser } from '@lemons_dev/parsinom/lib/Parser';
import { P_UTILS } from '@lemons_dev/parsinom/lib/ParserUtils';
import type { IPlugin } from 'packages/core/src/IPlugin';
import { ParsingError, runParser } from 'packages/core/src/parsers/ParsingError';
import {
	HLP_BindTarget,
	HLP_ButtonGroupDeclaration,
	HLP_InputFieldDeclaration,
	HLP_ViewFieldDeclaration,
} from 'packages/core/src/parsers/syntaxHighlighting/HLPs';
import type { Highlight } from 'packages/core/src/parsers/syntaxHighlighting/Highlight';
import { SyntaxHighlighting } from 'packages/core/src/parsers/syntaxHighlighting/SyntaxHighlighting';

import { FieldType, type InlineFieldType } from 'packages/core/src/config/APIConfigs';

export class SyntaxHighlightingAPI {
	public readonly plugin: IPlugin;

	constructor(plugin: IPlugin) {
		this.plugin = plugin;
	}

	highlightInputFieldDeclaration(str: string, trimWhiteSpace: boolean): SyntaxHighlighting {
		return this.highlightWithParser(str, trimWhiteSpace, HLP_InputFieldDeclaration);
	}

	highlightViewFieldDeclaration(str: string, trimWhiteSpace: boolean): SyntaxHighlighting {
		return this.highlightWithParser(str, trimWhiteSpace, HLP_ViewFieldDeclaration);
	}

	highlightInlineButtonDeclaration(str: string, trimWhiteSpace: boolean): SyntaxHighlighting {
		return this.highlightWithParser(str, trimWhiteSpace, HLP_ButtonGroupDeclaration);
	}

	highlight(str: string, inlineFieldType: InlineFieldType, trimWhiteSpace: boolean): SyntaxHighlighting {
		if (inlineFieldType === FieldType.INPUT) {
			return this.highlightInputFieldDeclaration(str, trimWhiteSpace);
		} else if (inlineFieldType === FieldType.VIEW) {
			return this.highlightViewFieldDeclaration(str, trimWhiteSpace);
		} else if (inlineFieldType === FieldType.BUTTON_GROUP) {
			return this.highlightInlineButtonDeclaration(str, trimWhiteSpace);
		}

		throw new Error(`Unknown MDRCType ${inlineFieldType}`);
	}

	highlightBindTarget(str: string, trimWhiteSpace: boolean): SyntaxHighlighting {
		return this.highlightWithParser(str, trimWhiteSpace, HLP_BindTarget);
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

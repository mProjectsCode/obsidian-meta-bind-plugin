import { type Parser } from '@lemons_dev/parsinom/lib/Parser';
import { P_UTILS } from '@lemons_dev/parsinom/lib/ParserUtils';
import { P } from '@lemons_dev/parsinom/lib/ParsiNOM';
import { runParser } from 'packages/core/src/parsers/ParsingError';
import { isUrl } from 'packages/core/src/utils/Utils';
import { P_FilePath } from 'packages/core/src/parsers/nomParsers/GeneralNomParsers';

const mdWikiLinkInnerParser: Parser<[string, string | undefined, string | undefined]> = P.sequence(
	P_FilePath, // the file path
	P.string('#').then(P.manyNotOf('[]#|^:')).optional(), // the optional heading
	P.string('|').then(P.manyNotOf('[]')).optional(), // the optional alias
);

const mdLinkParser: Parser<MarkdownLink> = P.or(
	// wiki links
	P.sequenceMap(
		(a, b): MarkdownLink => {
			return {
				isEmbed: a !== undefined,
				target: b[0],
				block: b[1],
				alias: b[2],
				internal: true,
			};
		},
		P.string('!').optional(),
		mdWikiLinkInnerParser.wrapString('[[', ']]'),
	),
	// standard markdown links
	P.sequenceMap(
		(a, b, c): MarkdownLink => {
			const internal = !isUrl(c);

			return {
				isEmbed: a !== undefined,
				target: c,
				block: undefined,
				alias: b,
				internal: internal,
			};
		},
		P.string('!').optional(),
		P.manyNotOf('[]').wrapString('[', ']'),
		P.manyNotOf('()').wrapString('(', ')'),
	),
);

const mdLinkListParser: Parser<MarkdownLink[]> = P.separateBy(
	mdLinkParser,
	P.string(',').trim(P_UTILS.optionalWhitespace()),
);

export interface MarkdownLink {
	isEmbed: boolean;
	target: string;
	block?: string;
	alias?: string;
	internal: boolean;
}

export class MDLinkParser {
	static parseLink(link: string): MarkdownLink {
		return runParser(mdLinkParser.thenEof(), link);
	}

	static parseLinkList(link: string): MarkdownLink[] {
		return runParser(mdLinkListParser.thenEof(), link);
	}

	static isLink(str: string): boolean {
		return mdLinkParser.thenEof().tryParse(str).success;
	}

	static urlToLink(url: URL): MarkdownLink {
		return {
			isEmbed: false,
			target: url.href,
			block: undefined,
			alias: url.hostname,
			internal: false,
		};
	}

	static parseLinkOrUrl(str: string): MarkdownLink {
		if (isUrl(str)) {
			return MDLinkParser.urlToLink(new URL(str));
		} else {
			return MDLinkParser.parseLink(str);
		}
	}

	static convertToLinkString(str: string): string {
		if (MDLinkParser.isLink(str)) {
			return str;
		} else if (isUrl(str)) {
			const url = new URL(str);
			return `[${url.hostname}](${str})`;
		} else if (MDLinkParser.isLink(`[[${str}]]`)) {
			return `[[${str}]]`;
		} else {
			return '';
		}
	}
}

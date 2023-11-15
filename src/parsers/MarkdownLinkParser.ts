import { P } from '@lemons_dev/parsinom/lib/ParsiNOM';
import { filePath } from './nomParsers/BindTargetParsers';
import { type Parser } from '@lemons_dev/parsinom/lib/Parser';
import { runParser } from './ParsingError';
import { P_UTILS } from '@lemons_dev/parsinom/lib/ParserUtils';

const mdWikiLinkInnerParser: Parser<[string, string | undefined, string | undefined]> = P.sequence(
	filePath, // the file path
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
			let internal: boolean;
			// if it's a URL, it's external
			try {
				new URL(c);
				internal = false;
			} catch (_) {
				internal = true;
			}

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

export function parseMdLink(link: string): MarkdownLink {
	return runParser(mdLinkParser.thenEof(), link);
}

export function parseMdLinkList(link: string): MarkdownLink[] {
	return runParser(mdLinkListParser.thenEof(), link);
}

export function isMdLink(str: string): boolean {
	return mdLinkParser.thenEof().tryParse(str).success;
}

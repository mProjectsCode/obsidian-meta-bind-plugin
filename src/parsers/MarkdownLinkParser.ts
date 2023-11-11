import { P } from '@lemons_dev/parsinom/lib/ParsiNOM';
import { filePath } from './nomParsers/BindTargetParsers';
import { type Parser } from '@lemons_dev/parsinom/lib/Parser';
import { runParser } from './ParsingError';
import { P_UTILS } from '@lemons_dev/parsinom/lib/ParserUtils';

const mdLinkInnerParser = P.sequence(
	filePath, // the file path
	P.string('#').then(P.manyNotOf('[]#|^:')).optional(), // the optional heading
	P.string('|').then(P.manyNotOf('[]')).optional(), // the optional alias
);

const mdLinkParser: Parser<MarkdownLink> = P.sequenceMap(
	(a, b) => {
		return {
			isEmbed: a !== undefined,
			target: b[0],
			block: b[1],
			alias: b[2],
		};
	},
	P.string('!').optional(),
	mdLinkInnerParser.wrapString('[[', ']]'),
);

const mdLinkListParser: Parser<MarkdownLink[]> = P.separateBy(mdLinkParser, P.string(',').trim(P_UTILS.optionalWhitespace()));

export interface MarkdownLink {
	isEmbed: boolean;
	target: string;
	block?: string;
	alias?: string;
}

export function parseMdLink(link: string): MarkdownLink {
	return runParser(mdLinkParser, link);
}

export function parseMdLinkList(link: string): MarkdownLink[] {
	return runParser(mdLinkListParser, link);
}

export function isMdLink(str: string): boolean {
	return (str.startsWith('![[') || str.startsWith('[[')) && str.endsWith(']]');
}

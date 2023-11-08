import { P } from '@lemons_dev/parsinom/lib/ParsiNOM';
import { P_UTILS } from '@lemons_dev/parsinom/lib/ParserUtils';
import { Parser } from '@lemons_dev/parsinom/lib/Parser';
import { UserError } from 'utils';

export interface Version {
	major: number;
	minor: number;
	patch: number;
}

const numberParser: Parser<number> = P_UTILS.digits()
	.map(x => Number.parseInt(x))
	.chain(x => {
		if (Number.isNaN(x)) {
			return P.fail('a number');
		} else {
			return P.succeed(x);
		}
	});

export const versionParser: Parser<Version> = P.sequenceMap(
	(major, _1, minor, _2, patch) => {
		return {
			major,
			minor,
			patch,
		};
	},
	numberParser,
	P.string('.'),
	numberParser,
	P.string('.'),
	numberParser,
);

export function parseVersion(str: string): Version {
	const parserRes = versionParser.tryParse(str);
	if (parserRes.success) {
		return parserRes.value;
	} else {
		throw new UserError(`failed to parse manifest version "${str}"`);
	}
}

export function stringifyVersion(version: Version): string {
	return `${version.major}.${version.minor}.${version.patch}`;
}

export function getIncrementOptions(version: Version): [Version, Version, Version] {
	return [
		{
			major: version.major + 1,
			minor: 0,
			patch: 0,
		},
		{
			major: version.major,
			minor: version.minor + 1,
			patch: 0,
		},
		{
			major: version.major,
			minor: version.minor,
			patch: version.patch + 1,
		},
	];
}

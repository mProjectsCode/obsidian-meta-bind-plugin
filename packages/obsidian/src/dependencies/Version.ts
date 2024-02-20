import { type Parser } from '@lemons_dev/parsinom/lib/Parser';
import { P_UTILS } from '@lemons_dev/parsinom/lib/ParserUtils';
import { P } from '@lemons_dev/parsinom/lib/ParsiNOM';
import { runParser } from 'packages/core/src/parsers/ParsingError';

const versionParser: Parser<Version> = P.sequenceMap(
	(a, b, c, d) => {
		const major = parseInt(a);
		const minor = parseInt(b);
		const patch = parseInt(c);

		return new Version(major, minor, patch, d);
	},
	P_UTILS.digits().skip(P.string('.')),
	P_UTILS.digits().skip(P.string('.')),
	P_UTILS.digits(),
	P.string('-').then(P_UTILS.remaining()).optional(),
);

export class Version {
	readonly major: number;
	readonly minor: number;
	readonly patch: number;
	readonly prerelease?: string | undefined;

	constructor(major: number, minor: number, patch: number, prerelease?: string | undefined) {
		this.major = major;
		this.minor = minor;
		this.patch = patch;
		this.prerelease = prerelease;
	}

	public static fromString(version: string): Version {
		return runParser(versionParser, version);
	}

	public static lessThan(a: Version, b: Version): boolean {
		if (a.major < b.major) {
			return true;
		} else if (a.major > b.major) {
			return false;
		}

		if (a.minor < b.minor) {
			return true;
		} else if (a.minor > b.minor) {
			return false;
		}

		if (a.patch < b.patch) {
			return true;
		} else if (a.patch > b.patch) {
			return false;
		}

		if (a.prerelease === undefined) {
			return false;
		} else if (b.prerelease === undefined) {
			return true;
		}

		return a.prerelease < b.prerelease;
	}

	public static greaterThan(a: Version, b: Version): boolean {
		return Version.lessThan(b, a);
	}

	public static equals(a: Version, b: Version): boolean {
		return a.major === b.major && a.minor === b.minor && a.patch === b.patch && a.prerelease === b.prerelease;
	}

	toString(): string {
		return `${this.major}.${this.minor}.${this.patch}${this.prerelease === undefined ? '' : `-${this.prerelease}`}`;
	}
}

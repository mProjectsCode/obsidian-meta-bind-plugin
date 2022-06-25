export class MetaBindInternalError extends Error {
	constructor(message: string) {
		super(`MB-INTERNAL ERROR | ${message} | please report this error here https://github.com/mProjectsCode/obsidian-meta-bind-plugin/issues`);
	}
}

export class CharPair {
	openingString: string;
	closingString: string;

	constructor(openingString: string, closingString: string) {
		if (openingString === closingString) {
			throw new MetaBindInternalError('opening string and closing string must not be equal');
		}

		this.openingString = openingString;
		this.closingString = closingString;
	}

	overlaps(other: CharPair): boolean {
		return (this.openingString === other.openingString) ||
			(this.openingString === other.closingString) ||
			(this.closingString === other.openingString) ||
			(this.closingString === other.closingString);
	}

	equals(other: CharPair): boolean {
		return (this.openingString === other.openingString) &&
			(this.closingString === other.closingString);
	}

	toString(): string {
		return JSON.stringify(this);
	}
}

export class ParserUtils {

	static split(str: string, separator: string, ignore: CharPair[] = []): string[] {
		if (!str) {
			throw new MetaBindInternalError('string must not be empty');
		}
		if (!separator) {
			throw new MetaBindInternalError('separator must not be empty');
		}
		for (let i = 0; i < ignore.length; i++) {
			for (let j = 0; j < ignore.length; j++) {
				if (i !== j && ignore[i].overlaps(ignore[j])) {
					throw new MetaBindInternalError(`excepts overlap, ${ignore[i].toString()} and ${ignore[j].toString()}`);
				}
			}
		}

		const strParts: string[] = [];
		const inCharPairs: CharPair[] = [];

		let currentStrPart: string = '';

		for (let i = 0; i < str.length; i++) {
			for (const charPair of ignore) {
				if (ParserUtils.isStringAt(str, charPair.openingString, i)) {
					inCharPairs.push(charPair);
				}
			}

			if (inCharPairs.length !== 0) {
				const lastCharPair = inCharPairs.at(-1);
				if (ParserUtils.isStringAt(str, lastCharPair.closingString, i)) {
					inCharPairs.pop();
					i += lastCharPair.closingString.length;
				}
			}

			if (inCharPairs.length === 0) { // not in an except
				if (ParserUtils.isStringAt(str, separator, i)) {
					strParts.push(currentStrPart);
					currentStrPart = '';
					i += separator.length - 1;
				} else {
					currentStrPart += str[i];
				}
			}
		}

		strParts.push(currentStrPart);

		return strParts;
	}

	// TODO: support quotation marks
	static sliceInBetween(str: string, charPair: CharPair) {
		if (!str) {
			throw new MetaBindInternalError('string must not be empty');
		}
		if (!charPair.openingString) {
			throw new MetaBindInternalError('opening string must not be empty');
		}
		if (!charPair.closingString) {
			throw new MetaBindInternalError('closing string must not be empty');
		}
		if (charPair.openingString === charPair.closingString) {
			throw new MetaBindInternalError('opening string must not equal closing string');
		}

		let openingCharCount: number = 0;
		let closingCharCount: number = 0;

		let subStr: string = '';

		for (let i = 0; i < str.length; i++) {
			if (ParserUtils.isStringAt(str, charPair.openingString, i)) {
				openingCharCount += 1;
			}
			if (ParserUtils.isStringAt(str, charPair.closingString, i)) {
				closingCharCount += 1;
			}

			if (openingCharCount > 0) {
				subStr += str[i];
			}

			if (openingCharCount > 0 && openingCharCount === closingCharCount) {
				return subStr.substring(charPair.openingString.length, subStr.length - charPair.closingString.length);
			}
		}

		return '';
	}

	static isStringAt(str: string, subStr: string, index: number): boolean {
		if (index < 0) {
			throw new MetaBindInternalError('index must be greater than 0');
		}
		if (index >= str.length) {
			throw new MetaBindInternalError('index out of bounds of string');
		}
		if (!str) {
			throw new MetaBindInternalError('string must not be empty');
		}
		if (!subStr) {
			throw new MetaBindInternalError('sub string must not be empty');
		}

		for (let i = 0; i < subStr.length; i++) {
			if (str[i + index] !== subStr[i]) {
				return false;
			}
		}

		return true;
	}
}

import {equalOrIncludes, isFalsy, MetaBindInternalError} from './Utils';


export class EnclosingPair {
	readonly openingEqualsClosing: boolean;
	private readonly _openingString: string;
	private readonly _closingString: string;

	constructor(openingString: string, closingString?: string) {
		if (isFalsy(openingString)) {
			throw new MetaBindInternalError('opening string must not be empty');
		}

		this.openingEqualsClosing = isFalsy(closingString) || openingString === closingString;

		this._openingString = openingString;
		this._closingString = closingString;
	}

	public get openingString(): string {
		return this._openingString;
	}

	public get closingString(): string {
		return this.openingEqualsClosing ? this._openingString : this._closingString;
	}

	overlaps(other: EnclosingPair): boolean {
		return equalOrIncludes(this.openingString, other.openingString) ||
			equalOrIncludes(this.openingString, other.closingString) ||
			equalOrIncludes(this.closingString, other.openingString) ||
			equalOrIncludes(this.closingString, other.closingString);
	}

	equals(other: EnclosingPair): boolean {
		if (isFalsy(other)) {
			return false;
		}
		return (this.openingString === other.openingString) && (this.closingString === other.closingString);
	}

	toString(): string {
		return JSON.stringify(this);
	}
}

export class ParserUtils {

	static split(str: string, separator: string, ignore?: EnclosingPair): string[] {
		if (!str) {
			throw new MetaBindInternalError('string must not be empty');
		}
		if (!separator) {
			throw new MetaBindInternalError('separator must not be empty');
		}

		let currentString = '';
		let strParts: string[] = [];

		if (ignore) {
			let remainingOpeningStringCount = ParserUtils.numberOfOccurrences(str, ignore.openingString);
			let remainingClosingStringCount = ParserUtils.numberOfOccurrences(str, ignore.closingString);

			let openingCharCount: number = 0;

			let subStr: string = '';

			strLoop : for (let i = 0; i < str.length; i++) {

				// console.log(openingCharCount, ParserUtils.isStringAt(str, separator, i));
				if (openingCharCount === 0 && ParserUtils.isStringAt(str, separator, i)) {
					strParts.push(currentString);
					currentString = '';
					i += separator.length - 1;
				} else {
					currentString += str[i];
				}

				if (ignore.openingEqualsClosing) {
					if (ParserUtils.isStringAt(str, ignore.openingString, i)) {
						if (openingCharCount % 2 === 0 && remainingOpeningStringCount === 1) {
							// not in a part that should be removed and there is still an opening string left, so we ignore it
						} else if (openingCharCount % 2 === 0) {
							// opening string
							openingCharCount += 1;

							// copy the opening string
							for (let j = 1; j < ignore.openingString.length; j++) {
								i += 1;
								currentString += str[i];

								if (i >= str.length) {
									break strLoop;
								}
							}
						} else {
							// closing string
							openingCharCount -= 1;

							// copy the closing string
							for (let j = 1; j < ignore.closingString.length; j++) { // (opening and closing string are the same)
								i += 1;
								currentString += str[i];

								if (i >= str.length) {
									break strLoop;
								}
							}
						}
						remainingOpeningStringCount -= 1;
					}
				} else {
					if (ParserUtils.isStringAt(str, ignore.openingString, i)) {
						// opening string
						if (remainingOpeningStringCount <= remainingClosingStringCount) {
							// str still has sufficient closing string to find this a partner
							openingCharCount += 1;

							// copy the opening string
							for (let j = 1; j < ignore.openingString.length; j++) {
								i += 1;
								currentString += str[i];

								if (i >= str.length) {
									break strLoop;
								}
							}
						}
						remainingOpeningStringCount -= 1;
					} else if (ParserUtils.isStringAt(str, ignore.closingString, i)) {
						// closing string
						if (openingCharCount > 0) {
							// there was an opening string before this
							openingCharCount -= 1;

							// copy the closing string
							for (let j = 1; j < ignore.closingString.length; j++) {
								i += 1;
								currentString += str[i];

								if (i >= str.length) {
									break strLoop;
								}
							}
						}
						remainingClosingStringCount -= 1;
					}
				}


			}
		} else {
			for (let i = 0; i < str.length; i++) {

				if (ParserUtils.isStringAt(str, separator, i)) {
					strParts.push(currentString);
					currentString = '';
					i += separator.length - 1;
				} else {
					currentString += str[i];
				}
			}
		}

		strParts.push(currentString);

		return strParts;
	}

	static removeInBetween(str: string, charPair: EnclosingPair) {
		if (!str) {
			throw new MetaBindInternalError('string must not be empty');
		}

		let remainingOpeningStringCount = ParserUtils.numberOfOccurrences(str, charPair.openingString);
		let remainingClosingStringCount = ParserUtils.numberOfOccurrences(str, charPair.closingString);

		let openingCharCount: number = 0;

		let subStr: string = '';

		for (let i = 0; i < str.length; i++) {
			if (charPair.openingEqualsClosing) {
				if (ParserUtils.isStringAt(str, charPair.openingString, i)) {
					if (openingCharCount % 2 === 0 && remainingOpeningStringCount === 1) {
						// not in a part that should be removed and there is still an opening string left, so we ignore it
					} else if (openingCharCount % 2 === 0) {
						// opening string
						openingCharCount += 1;

						// skip the opening string
						i += charPair.openingString.length;
						if (i >= str.length) {
							break;
						}
					} else {
						// closing string
						openingCharCount -= 1;

						// skip the closing string
						i += charPair.closingString.length; // (opening and closing string are the same)
						if (i >= str.length) {
							break;
						}
					}
					remainingOpeningStringCount -= 1;
				}
			} else {
				if (ParserUtils.isStringAt(str, charPair.openingString, i)) {
					// opening string
					if (remainingOpeningStringCount <= remainingClosingStringCount) {
						// str still has sufficient closing string to find this a partner
						openingCharCount += 1;

						// skip the opening string
						i += charPair.openingString.length;
						if (i >= str.length) {
							break;
						}
					}
					remainingOpeningStringCount -= 1;
				} else if (ParserUtils.isStringAt(str, charPair.closingString, i)) {
					// closing string
					if (openingCharCount > 0) {
						// there was an opening string before this
						openingCharCount -= 1;

						// skip the closing string
						i += charPair.closingString.length;
						if (i >= str.length) {
							break;
						}
					}
					remainingClosingStringCount -= 1;
				}
			}

			if (openingCharCount === 0) {
				subStr += str[i];
			}

		}

		return subStr;
	}

	static getInBetween(str: string, charPair: EnclosingPair): string | string[] {
		if (!str) {
			throw new MetaBindInternalError('string must not be empty');
		}

		let remainingOpeningStringCount = ParserUtils.numberOfOccurrences(str, charPair.openingString);
		let remainingClosingStringCount = ParserUtils.numberOfOccurrences(str, charPair.closingString);

		let openingCharCount: number = 0;

		let subStr: string = '';
		let subStrParts: string[] = [];

		strLoop : for (let i = 0; i < str.length; i++) {
			if (charPair.openingEqualsClosing) {
				if (ParserUtils.isStringAt(str, charPair.openingString, i)) {
					if (openingCharCount % 2 === 0 && remainingOpeningStringCount === 1) {
						// not in a part that should be removed and there is still an opening string left, so we ignore it
					} else if (openingCharCount % 2 === 0) {
						// opening string
						openingCharCount += 1;

						// skip the opening string
						subStr += str[i];
						for (let j = 1; j < charPair.openingString.length; j++) {
							i += 1;
							subStr += str[i];

							if (i >= str.length) {
								break strLoop;
							}
						}
					} else {
						// closing string
						openingCharCount -= 1;

						// skip the closing string
						subStr += str[i];
						for (let j = 1; j < charPair.closingString.length; j++) { // (opening and closing string are the same)
							i += 1;
							subStr += str[i];

							if (i > str.length) {
								break strLoop;
							}
						}
						subStrParts.push(subStr);
						subStr = '';
					}
					remainingOpeningStringCount -= 1;
				} else {
					if (openingCharCount >= 1) {
						subStr += str[i];
					}
				}
			} else {
				if (ParserUtils.isStringAt(str, charPair.openingString, i)) {
					// opening string
					if (remainingOpeningStringCount <= remainingClosingStringCount) {
						// str still has sufficient closing string to find this a partner
						openingCharCount += 1;

						// copy the opening string
						subStr += str[i];
						for (let j = 1; j < charPair.openingString.length; j++) {
							i += 1;
							subStr += str[i];

							if (i >= str.length) {
								break strLoop;
							}
						}
					}
					remainingOpeningStringCount -= 1;
				} else if (ParserUtils.isStringAt(str, charPair.closingString, i)) {
					// closing string
					if (openingCharCount > 0) {
						// there was an opening string before this
						openingCharCount -= 1;

						// copy the closing string
						subStr += str[i];
						for (let j = 1; j < charPair.closingString.length; j++) {
							i += 1;
							subStr += str[i];

							if (i > str.length) {
								break strLoop;
							}
						}

						if (openingCharCount === 0) {
							subStrParts.push(subStr);
							subStr = '';
						}
					}
					remainingClosingStringCount -= 1;
				} else {
					if (openingCharCount >= 1) {
						subStr += str[i];
					}
				}
			}


		}

		if (subStrParts.length === 0) {
			return '';
		} else if (subStrParts.length === 1) {
			return subStrParts[0].substring(charPair.openingString.length, subStrParts[0].length - charPair.closingString.length);
		} else {
			return subStrParts.map(x => x.substring(charPair.openingString.length, x.length - charPair.closingString.length));
		}
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

	static contains(str: string, subStr: string): boolean {
		return ParserUtils.numberOfOccurrences(str, subStr) > 0;
	}

	static numberOfOccurrences(str: string, subStr: string): number {
		if (!str) {
			throw new MetaBindInternalError('string must not be empty');
		}
		if (!subStr) {
			throw new MetaBindInternalError('sub string must not be empty');
		}

		let occurrences = 0;
		for (let i = 0; i < str.length; i++) {
			if (ParserUtils.isStringAt(str, subStr, i)) {
				occurrences += 1;
			}
		}

		return occurrences;
	}
}

import { equalOrIncludes, isFalsy } from './Utils';
import { ErrorLevel, MetaBindInternalError } from './errors/MetaBindErrors';

export class EnclosingPair {
	readonly openingEqualsClosing: boolean;
	private readonly _openingString: string;
	private readonly _closingString: string;

	constructor(openingString: string, closingString?: string) {
		if (isFalsy(openingString)) {
			throw new MetaBindInternalError({
				errorLevel: ErrorLevel.ERROR,
				effect: 'failed to create enclosing pair',
				cause: 'opening string must not be empty',
			});
		}

		this.openingEqualsClosing = isFalsy(closingString) || openingString === closingString;

		if (this.openingEqualsClosing) {
			this._openingString = openingString;
			this._closingString = openingString;
		} else {
			this._openingString = openingString;
			// @ts-ignore this can not be undefined here
			this._closingString = closingString;
		}
	}

	public get openingString(): string {
		return this._openingString;
	}

	public get closingString(): string {
		return this.openingEqualsClosing ? this._openingString : this._closingString;
	}

	overlaps(other: EnclosingPair): boolean {
		return (
			equalOrIncludes(this.openingString, other.openingString) ||
			equalOrIncludes(this.openingString, other.closingString) ||
			equalOrIncludes(this.closingString, other.openingString) ||
			equalOrIncludes(this.closingString, other.closingString)
		);
	}

	equals(other: EnclosingPair): boolean {
		if (isFalsy(other)) {
			return false;
		}
		return this.openingString === other.openingString && this.closingString === other.closingString;
	}

	toString(): string {
		return JSON.stringify(this);
	}
}

export class ParserUtils {
	// TODO: rename stuff
	static split(str: string, separator: string, ignore?: EnclosingPair): string[] {
		if (!str) {
			throw new MetaBindInternalError({ errorLevel: ErrorLevel.ERROR, effect: 'failed to split string', cause: 'string must not be empty' });
		}
		if (!separator) {
			throw new MetaBindInternalError({ errorLevel: ErrorLevel.ERROR, effect: 'failed to split string', cause: 'separator must not be empty' });
		}

		let subStr: string = '';
		const subStrings: string[] = [];

		if (ignore) {
			let remainingOpeningStringCount = ParserUtils.numberOfOccurrences(str, ignore.openingString);
			let remainingClosingStringCount = ParserUtils.numberOfOccurrences(str, ignore.closingString);

			let enclosingLevel: number = 0;

			strLoop: for (let i = 0; i < str.length; i++) {
				// ignore specified
				if (enclosingLevel === 0 && ParserUtils.isStringAt(str, separator, i)) {
					subStrings.push(subStr);
					subStr = '';
					i += separator.length - 1;
				} else {
					subStr += str[i];
				}

				if (ignore.openingEqualsClosing) {
					if (ParserUtils.isStringAt(str, ignore.openingString, i)) {
						if (enclosingLevel % 2 === 0 && remainingOpeningStringCount === 1) {
							// not in a part that should be removed and there is still an opening string left, so we ignore it
						} else if (enclosingLevel % 2 === 0) {
							// opening string
							enclosingLevel += 1;

							// copy the opening string
							for (let j = 1; j < ignore.openingString.length; j++) {
								i += 1;
								subStr += str[i];

								if (i >= str.length) {
									break strLoop;
								}
							}
						} else {
							// closing string
							enclosingLevel -= 1;

							// copy the closing string
							for (let j = 1; j < ignore.closingString.length; j++) {
								// (opening and closing string are the same)
								i += 1;
								subStr += str[i];

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
							enclosingLevel += 1;

							// copy the opening string
							for (let j = 1; j < ignore.openingString.length; j++) {
								i += 1;
								subStr += str[i];

								if (i >= str.length) {
									break strLoop;
								}
							}
						}
						remainingOpeningStringCount -= 1;
					} else if (ParserUtils.isStringAt(str, ignore.closingString, i)) {
						// closing string
						if (enclosingLevel > 0) {
							// there was an opening string before this
							enclosingLevel -= 1;

							// copy the closing string
							for (let j = 1; j < ignore.closingString.length; j++) {
								i += 1;
								subStr += str[i];

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
			// no ignore specified
			for (let i = 0; i < str.length; i++) {
				if (ParserUtils.isStringAt(str, separator, i)) {
					subStrings.push(subStr);
					subStr = '';
					i += separator.length - 1;
				} else {
					subStr += str[i];
				}
			}
		}

		subStrings.push(subStr);

		return subStrings;
	}

	static removeInBetween(str: string, enclosingPair: EnclosingPair): string {
		if (!str) {
			throw new MetaBindInternalError({ errorLevel: ErrorLevel.ERROR, effect: 'failed remove in between in string', cause: 'string must not be empty' });
		}

		let remainingOpeningStringCount = ParserUtils.numberOfOccurrences(str, enclosingPair.openingString);
		let remainingClosingStringCount = ParserUtils.numberOfOccurrences(str, enclosingPair.closingString);

		let enclosingLevel: number = 0;

		let subStr: string = '';

		for (let i = 0; i < str.length; i++) {
			if (enclosingPair.openingEqualsClosing) {
				if (ParserUtils.isStringAt(str, enclosingPair.openingString, i)) {
					if (enclosingLevel % 2 === 0 && remainingOpeningStringCount === 1) {
						// not in a part that should be removed and there is still an opening string left, so we ignore it
					} else if (enclosingLevel % 2 === 0) {
						// opening string
						enclosingLevel += 1;

						// skip the opening string
						i += enclosingPair.openingString.length;
						if (i >= str.length) {
							break;
						}
					} else {
						// closing string
						enclosingLevel -= 1;

						// skip the closing string
						i += enclosingPair.closingString.length; // (opening and closing string are the same)
						if (i >= str.length) {
							break;
						}
					}
					remainingOpeningStringCount -= 1;
				}
			} else {
				if (ParserUtils.isStringAt(str, enclosingPair.openingString, i)) {
					// opening string
					if (remainingOpeningStringCount <= remainingClosingStringCount) {
						// str still has sufficient closing string to find this a partner
						enclosingLevel += 1;

						// skip the opening string
						i += enclosingPair.openingString.length;
						if (i >= str.length) {
							break;
						}
					}
					remainingOpeningStringCount -= 1;
				} else if (ParserUtils.isStringAt(str, enclosingPair.closingString, i)) {
					// closing string
					if (enclosingLevel > 0) {
						// there was an opening string before this
						enclosingLevel -= 1;

						// skip the closing string
						i += enclosingPair.closingString.length;
						if (i >= str.length) {
							break;
						}
					}
					remainingClosingStringCount -= 1;
				}
			}

			if (enclosingLevel === 0) {
				subStr += str[i];
			}
		}

		return subStr;
	}

	static getInBetween(str: string, enclosingPair: EnclosingPair): string | string[] {
		if (!str) {
			throw new MetaBindInternalError({ errorLevel: ErrorLevel.ERROR, effect: 'failed to get in between in string', cause: 'string must not be empty' });
		}

		let remainingOpeningStringCount = ParserUtils.numberOfOccurrences(str, enclosingPair.openingString);
		let remainingClosingStringCount = ParserUtils.numberOfOccurrences(str, enclosingPair.closingString);

		let enclosingLevel: number = 0;

		let subStr: string = '';
		const subStrings: string[] = [];

		strLoop: for (let i = 0; i < str.length; i++) {
			if (enclosingPair.openingEqualsClosing) {
				if (ParserUtils.isStringAt(str, enclosingPair.openingString, i)) {
					if (enclosingLevel % 2 === 0 && remainingOpeningStringCount === 1) {
						// not in a part that should be removed and there is still an opening string left, so we ignore it
					} else if (enclosingLevel % 2 === 0) {
						// opening string
						enclosingLevel += 1;

						// skip the opening string
						subStr += str[i];
						for (let j = 1; j < enclosingPair.openingString.length; j++) {
							i += 1;
							subStr += str[i];

							if (i >= str.length) {
								break strLoop;
							}
						}
					} else {
						// closing string
						enclosingLevel -= 1;

						// skip the closing string
						subStr += str[i];
						for (let j = 1; j < enclosingPair.closingString.length; j++) {
							// (opening and closing string are the same)
							i += 1;
							subStr += str[i];

							if (i > str.length) {
								break strLoop;
							}
						}
						subStrings.push(subStr);
						subStr = '';
					}
					remainingOpeningStringCount -= 1;
				} else {
					if (enclosingLevel >= 1) {
						subStr += str[i];
					}
				}
			} else {
				if (ParserUtils.isStringAt(str, enclosingPair.openingString, i)) {
					// opening string
					if (remainingOpeningStringCount <= remainingClosingStringCount) {
						// str still has sufficient closing string to find this a partner
						enclosingLevel += 1;

						// copy the opening string
						subStr += str[i];
						for (let j = 1; j < enclosingPair.openingString.length; j++) {
							i += 1;
							subStr += str[i];

							if (i >= str.length) {
								break strLoop;
							}
						}
					}
					remainingOpeningStringCount -= 1;
				} else if (ParserUtils.isStringAt(str, enclosingPair.closingString, i)) {
					// closing string
					if (enclosingLevel > 0) {
						// there was an opening string before this
						enclosingLevel -= 1;

						// copy the closing string
						subStr += str[i];
						for (let j = 1; j < enclosingPair.closingString.length; j++) {
							i += 1;
							subStr += str[i];

							if (i > str.length) {
								break strLoop;
							}
						}

						if (enclosingLevel === 0) {
							subStrings.push(subStr);
							subStr = '';
						}
					}
					remainingClosingStringCount -= 1;
				} else {
					if (enclosingLevel >= 1) {
						subStr += str[i];
					}
				}
			}
		}

		if (subStrings.length === 0) {
			return '';
		} else if (subStrings.length === 1) {
			return subStrings[0].substring(enclosingPair.openingString.length, subStrings[0].length - enclosingPair.closingString.length);
		} else {
			return subStrings.map(x => x.substring(enclosingPair.openingString.length, x.length - enclosingPair.closingString.length));
		}
	}

	static isStringAt(str: string, subStr: string, index: number): boolean {
		if (index < 0) {
			throw new MetaBindInternalError({
				errorLevel: ErrorLevel.ERROR,
				effect: 'failed to check is string is at index',
				cause: 'index must be greater than 0',
			});
		}
		if (index >= str.length) {
			throw new MetaBindInternalError({
				errorLevel: ErrorLevel.ERROR,
				effect: 'failed to check is string is at index',
				cause: 'index out of bounds of string',
			});
		}
		if (!str) {
			throw new MetaBindInternalError({
				errorLevel: ErrorLevel.ERROR,
				effect: 'failed to check is string is at index',
				cause: 'string must not be empty',
			});
		}
		if (!subStr) {
			throw new MetaBindInternalError({
				errorLevel: ErrorLevel.ERROR,
				effect: 'failed to check is string is at index',
				cause: 'sub string must not be empty',
			});
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
			throw new MetaBindInternalError({ errorLevel: ErrorLevel.ERROR, effect: 'failed count number of occurrences', cause: 'string must not be empty' });
		}
		if (!subStr) {
			throw new MetaBindInternalError({
				errorLevel: ErrorLevel.ERROR,
				effect: 'failed count number of occurrences',
				cause: 'sub string must not be empty',
			});
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

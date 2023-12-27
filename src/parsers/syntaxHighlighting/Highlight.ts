import { type ParsingRange } from '@lemons_dev/parsinom/lib/HelperTypes';
import { type MB_TokenClass } from './HLPUtils';

export class Highlight {
	readonly range: ParsingRange;
	readonly tokenClass: MB_TokenClass;

	constructor(range: ParsingRange, tokenClass: MB_TokenClass) {
		this.range = range;
		this.tokenClass = tokenClass;
	}
}

export enum LineNumberOp {
	ADD = '+',
	SUB = '-',
}

export function lineNumberOpFromString(op: string): LineNumberOp {
	if (op === '+') {
		return LineNumberOp.ADD;
	} else if (op === '-') {
		return LineNumberOp.SUB;
	}
	throw new Error(`Invalid LineNumberOp: ${op}`);
}

export function lineNumberOpToNumber(op: LineNumberOp | undefined): number {
	if (op === undefined) {
		return 1;
	} else if (op === LineNumberOp.ADD) {
		return 1;
	} else if (op === LineNumberOp.SUB) {
		return -1;
	} else {
		throw new Error(`Invalid LineNumberOp: ${op}`);
	}
}

export interface LineNumberContext {
	/**
	 * Start of the file, so 1.
	 */
	fileStart: number;
	/**
	 * End of the file, so the number of lines in the file.
	 */
	fileEnd: number;
	/**
	 * Start of the frontmatter, so 1.
	 */
	frontmatterStart: number;
	/**
	 * End of the frontmatter, so the line number of the last line of the frontmatter (with the ending "---").
	 */
	frontmatterEnd: number;
	/**
	 * The line after the frontmatter, so the first line of the content.
	 */
	contentStart: number;
	/**
	 * The end of the file, so the last line of the content.
	 */
	contentEnd: number;
	/**
	 * The start of the code block, so "```language".
	 */
	selfStart?: number;
	/**
	 * The end of the code block, so "```".
	 */
	selfEnd?: number;
}

export class LineNumberExpression {
	literal: string | undefined;
	op: LineNumberOp | undefined;
	number: number | undefined;

	constructor(literal: string | undefined, op: LineNumberOp | undefined, number: number | undefined) {
		this.literal = literal;
		this.op = op;
		this.number = number;
	}

	evaluate(context: LineNumberContext): number {
		const resolvedLiteral = this.resolveLiteral(context);
		const op = lineNumberOpToNumber(this.op);

		if (resolvedLiteral !== undefined && this.number !== undefined) {
			return resolvedLiteral + this.number * op;
		}

		if (this.number !== undefined) {
			return this.number * op;
		}

		if (resolvedLiteral !== undefined) {
			return resolvedLiteral;
		}

		return 0;
	}

	resolveLiteral(context: LineNumberContext): number | undefined {
		if (this.literal === undefined) {
			return undefined;
		}

		if (this.literal in context) {
			return (context as unknown as Record<string, number>)[this.literal];
		} else {
			throw new Error(`Error while evaluating line number expression: Literal "${this.literal}" not available.`);
		}
	}
}

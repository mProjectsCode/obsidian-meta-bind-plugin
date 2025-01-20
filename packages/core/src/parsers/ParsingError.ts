import type { ParseFailure, ParsingRange } from '@lemons_dev/parsinom/lib/HelperTypes';
import type { Parser } from '@lemons_dev/parsinom/lib/Parser';
import { ErrorLevel, ErrorType, MetaBindError } from 'packages/core/src/utils/errors/MetaBindErrors';

export function runParser<T>(parser: Parser<T>, str: string): T {
	const result = parser.thenEof().tryParse(str);
	if (result.success) {
		return result.value;
	} else {
		throw new ParsingError(ErrorLevel.ERROR, 'parsiNOM parser', str, result);
	}
}

export class ParsingError extends MetaBindError {
	str: string;
	parseFailure: ParseFailure;
	source: string;

	constructor(errorLevel: ErrorLevel, source: string, str: string, parseFailure: ParseFailure) {
		super({
			errorLevel: errorLevel,
			effect: 'Failed to parse. Check that your syntax is correct.',
			cause: `expected ${parseFailure.expected.sort().join(' or ')}`,
		});

		this.str = str;
		this.parseFailure = parseFailure;
		this.source = source;

		this.updateMessage2();
	}

	public getErrorType(): ErrorType {
		return ErrorType.PARSINOM;
	}

	protected updateMessage2(): void {
		if (this.cause instanceof Error) {
			this.message = `[${this.getErrorType()}] "${this.effect}" caused by error "${this.cause.message}"\n`;
		} else {
			this.message = `[${this.getErrorType()}] "${this.effect}" caused by "${this.cause}"\n`;
		}

		const lines = this.str.split('\n');
		const failedLine = lines[this.parseFailure.furthest.line - 1]; // line is a one based index

		const linePrefix = `${this.parseFailure.furthest.line} |   `;
		this.positionContext = `${linePrefix}${failedLine}`;
		this.positionContext += `\n${this.getUnderline(linePrefix.length)}\n`;

		this.message += '\n' + this.positionContext;
	}

	private getUnderline(offset: number): string {
		const spacing = ' '.repeat(this.parseFailure.furthest.column + offset - 1);
		const underline = `^ (${this.cause})`;

		return spacing + underline;
	}
}

export class ParsingValidationError extends MetaBindError {
	str?: string;
	position?: ParsingRange;
	source: string;

	constructor(
		errorLevel: ErrorLevel,
		source: string,
		cause: string,
		str?: string,
		position?: ParsingRange,
		docs?: string[],
	) {
		super({
			errorLevel: errorLevel,
			effect: 'Failed to validate the result of the parser.',
			cause: cause,
			docs: docs,
		});

		this.str = str;
		this.position = position;
		this.source = source;

		this.updateMessage2();
	}

	public getErrorType(): ErrorType {
		return ErrorType.VALIDATION;
	}

	protected updateMessage2(): void {
		if (this.cause instanceof Error) {
			this.message = `[${this.getErrorType()}] "${this.effect}" caused by error "${this.cause.message}"\n`;
		} else {
			this.message = `[${this.getErrorType()}] "${this.effect}" caused by "${this.cause}"\n`;
		}

		if (this.str && this.position) {
			const lines = this.str.split('\n');
			const failedLine = lines[this.position.from.line - 1]; // line is a one based index

			const linePrefix = `${this.position.from.line} |   `;
			this.positionContext = `${linePrefix}${failedLine}`;
			this.positionContext += `\n${this.getUnderline(linePrefix.length, failedLine.length)}\n`;

			this.message += '\n' + this.positionContext;
		}
	}

	private getUnderline(offset: number, lineLength: number): string {
		if (this.position === undefined) {
			return '';
		}

		const spacing = ' '.repeat(this.position.from.column + offset - 1);
		// highlight to the end if the end is on the same line. If the end is on a different line, highlight to the end of the line.
		const toIndex = this.position.to.line === this.position.from.line ? this.position.to.column : lineLength;
		const underline = '^'.repeat(toIndex - this.position.from.column);

		return spacing + underline;
	}
}

import type { ParseFailure, ParsingRange } from '@lemons_dev/parsinom/lib/HelperTypes';
import type { Parser } from '@lemons_dev/parsinom/lib/Parser';
import { mapIndexToLineColumn } from '@lemons_dev/parsinom/lib/ParserError';
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

		const furthestPosition = mapIndexToLineColumn(this.str, this.parseFailure.furthest);
		const lines = this.str.split('\n');
		const failedLine = lines[furthestPosition.line - 1] ?? ''; // line is a one based index

		const linePrefix = `${furthestPosition.line} |   `;
		this.positionContext = `${linePrefix}${failedLine}`;
		this.positionContext += `\n${this.getUnderline(linePrefix.length, furthestPosition.column)}\n`;

		this.message += '\n' + this.positionContext;
	}

	private getUnderline(offset: number, column: number): string {
		const spacing = ' '.repeat(column + offset - 1);
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
			const fromPosition = mapIndexToLineColumn(this.str, this.position.from);
			const toPosition = mapIndexToLineColumn(this.str, this.position.to);
			const lines = this.str.split('\n');
			const failedLine = lines[fromPosition.line - 1] ?? ''; // line is a one based index

			const linePrefix = `${fromPosition.line} |   `;
			this.positionContext = `${linePrefix}${failedLine}`;
			this.positionContext += `\n${this.getUnderline(linePrefix.length, failedLine.length, fromPosition, toPosition)}\n`;

			this.message += '\n' + this.positionContext;
		}
	}

	private getUnderline(
		offset: number,
		lineLength: number,
		fromPosition: { line: number; column: number },
		toPosition: { line: number; column: number },
	): string {
		if (this.position === undefined) {
			return '';
		}

		const spacing = ' '.repeat(fromPosition.column + offset - 1);
		// Highlight to the end if the end is on a different line.
		const toColumn = toPosition.line === fromPosition.line ? toPosition.column : lineLength + 1;
		const underline = '^'.repeat(Math.max(1, toColumn - fromPosition.column));

		return spacing + underline;
	}
}

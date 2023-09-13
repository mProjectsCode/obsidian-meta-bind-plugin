import { ErrorLevel, ErrorType, MetaBindError } from '../utils/errors/MetaBindErrors';
import { ParseFailure, ParsingRange } from '@lemons_dev/parsinom/lib/HelperTypes';

export class ParsingError extends MetaBindError {
	str: string;
	parseFailure: ParseFailure;
	source: string;

	constructor(errorLevel: ErrorLevel, source: string, str: string, parseFailure: ParseFailure) {
		super(errorLevel, 'failed to parse', 'expected' + parseFailure.expected.join(' or '), {});

		this.str = str;
		this.parseFailure = parseFailure;
		this.source = source;

		this.updateMessage2();
	}

	public getErrorType(): ErrorType {
		return ErrorType.PARSING;
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
		this.message += `\n\n${linePrefix}${failedLine}`;
		this.message += `\n${' '.repeat(this.parseFailure.furthest.column - 1 + linePrefix.length)}^ (${this.cause})`;
	}
}

export class ParsingValidationError extends MetaBindError {
	str?: string;
	position?: ParsingRange;
	source: string;

	constructor(errorLevel: ErrorLevel, source: string, cause: string, str?: string, position?: ParsingRange) {
		super(errorLevel, 'failed to parse', cause, {});

		this.str = str;
		this.position = position;
		this.source = source;

		this.updateMessage2();
	}

	public getErrorType(): ErrorType {
		return ErrorType.PARSING;
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
			this.message += `\n\n${linePrefix}${failedLine}`;
			this.message += `\n${' '.repeat(this.position.from.column - 1 + linePrefix.length)}${'^'.repeat(
				(this.position.to.line === this.position.from.line ? this.position.to.index : failedLine.length) - this.position.from.index
			)} (${this.cause})`;
		}
	}
}

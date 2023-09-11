import { ErrorLevel, ErrorType, MetaBindError } from '../utils/errors/MetaBindErrors';
import { ParseFailure } from '@lemons_dev/parsinom/lib/HelperTypes';
import { ParsingRange } from './newInputFieldParser/InputFieldDeclarationValidator';

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

		this.message += this.str + '\n';
		this.message += ' '.repeat(this.parseFailure.furthest.index) + '^' + '\n';
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
			this.message += this.str + '\n';
			this.message += ' '.repeat(this.position.start.index) + '^'.repeat(this.position.end.index - this.position.start.index) + '\n';
		}
	}
}

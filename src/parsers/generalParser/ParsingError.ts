import { ErrorLevel, ErrorType, MetaBindError } from '../../utils/errors/MetaBindErrors';
import { AbstractToken } from './ParsingUtils';

export class ParsingError extends MetaBindError {
	str: string;
	token: AbstractToken<string> | undefined;
	source: string;

	constructor(
		errorLevel: ErrorLevel,
		effect: string,
		cause: string | Error,
		context: Record<string, any>,
		str: string,
		token: AbstractToken<string> | undefined,
		source: string
	) {
		super(errorLevel, effect, cause, context);

		this.str = str;
		this.token = token;
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

		if (this.token) {
			this.message += this.str + '\n';
			this.message += ' '.repeat(this.token.range.from) + '^'.repeat(this.token.range.to - this.token.range.from + 1) + '\n';
		}
	}
}

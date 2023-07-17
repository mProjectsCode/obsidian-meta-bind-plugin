export enum ErrorLevel {
	CRITICAL = 'CRITICAL',
	ERROR = 'ERROR',
	WARNING = 'WARNING',
}

export enum ErrorType {
	INTERNAL = 'MB_INTERNAL_ERROR',
	PARSING = 'MB_PARSING_ERROR',
	BIND_TARGET = 'MB_BIND_TARGET_ERROR',
	VALUE = 'MB_VALUE_ERROR',
	ARGUMENT = 'MB_ARGUMENT_ERROR',
	JS = 'MB_JS_ERROR',
	EXPRESSION = 'MB_EXPRESSION_ERROR',
	PUBLISH = 'MB_PUBLISH_ERROR',

	OTHER = 'OTHER',
}

export abstract class MetaBindError extends Error {
	abstract getErrorType(): ErrorType;

	errorLevel: ErrorLevel;
	effect: string;
	cause: string | Error;
	context: Record<string, any>;

	constructor(errorLevel: ErrorLevel, effect: string, cause: string | Error, context: Record<string, any> = {}) {
		super('');

		this.errorLevel = errorLevel;
		this.effect = effect;
		this.cause = cause;
		this.context = context;

		this.updateMessage();
	}

	protected updateMessage(): void {
		if (this.cause instanceof Error) {
			this.message = `[${this.getErrorType()}] "${this.effect}" caused by error "${this.cause.message}"`;
		} else {
			this.message = `[${this.getErrorType()}] "${this.effect}" caused by "${this.cause}"`;
		}
	}

	public log(): void {
		console.log(this.message, this.stack, this.context);
	}
}

export class MetaBindInternalError extends MetaBindError {
	public getErrorType(): ErrorType {
		return ErrorType.INTERNAL;
	}
}

export class MetaBindParsingError extends MetaBindError {
	public getErrorType(): ErrorType {
		return ErrorType.PARSING;
	}
}

export class MetaBindBindTargetError extends MetaBindError {
	public getErrorType(): ErrorType {
		return ErrorType.BIND_TARGET;
	}
}

export class MetaBindValueError extends MetaBindError {
	public getErrorType(): ErrorType {
		return ErrorType.VALUE;
	}
}

export class MetaBindArgumentError extends MetaBindError {
	public getErrorType(): ErrorType {
		return ErrorType.ARGUMENT;
	}
}

export class MetaBindJsError extends MetaBindError {
	public getErrorType(): ErrorType {
		return ErrorType.JS;
	}
}

export class MetaBindExpressionError extends MetaBindError {
	public getErrorType(): ErrorType {
		return ErrorType.EXPRESSION;
	}
}

export class MetaBindPublishError extends MetaBindError {
	public getErrorType(): ErrorType {
		return ErrorType.PUBLISH;
	}
}

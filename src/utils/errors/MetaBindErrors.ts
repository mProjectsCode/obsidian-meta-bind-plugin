export enum ErrorLevel {
	CRITICAL = 'CRITICAL',
	ERROR = 'ERROR',
	WARNING = 'WARNING',
}

export enum ErrorType {
	INTERNAL = 'MB_INTERNAL',
	PARSING = 'MB_PARSING',
	BIND_TARGET = 'MB_BIND_TARGET',
	VALUE = 'MB_VALUE',
	ARGUMENT = 'MB_ARGUMENT',
	JS = 'MB_JS',
	EXPRESSION = 'MB_EXPRESSION',
	PUBLISH = 'MB_PUBLISH',
	VALIDATION = 'MB_VALIDATION',
	PARSINOM = 'MB_PARSINOM',
	EXAMPLE = 'MB_EXAMPLE',
	EMBED = 'MB_EMBED',

	OTHER = 'OTHER',
}

interface MetaBindErrorParams {
	errorLevel: ErrorLevel;
	effect: string;
	cause: string | Error;
	tip?: string;
	docs?: string[];
	context?: Record<string, unknown>;
	positionContext?: string;
}

export abstract class MetaBindError extends Error {
	abstract getErrorType(): ErrorType;

	errorLevel: ErrorLevel;
	effect: string;
	cause: string | Error;
	tip?: string;
	docs?: string[];
	context?: Record<string, unknown>;
	positionContext?: string;

	constructor(params: MetaBindErrorParams) {
		super('');

		this.errorLevel = params.errorLevel;
		this.effect = params.effect;
		this.cause = params.cause;
		this.tip = params.tip;
		this.docs = params.docs;
		this.context = params.context;
		this.positionContext = params.positionContext;

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

export class MetaBindValidationError extends MetaBindError {
	public getErrorType(): ErrorType {
		return ErrorType.VALIDATION;
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

export class MetaBindExampleError extends MetaBindError {
	public getErrorType(): ErrorType {
		return ErrorType.EXAMPLE;
	}
}

export class MetaBindEmbedError extends MetaBindError {
	public getErrorType(): ErrorType {
		return ErrorType.EMBED;
	}
}

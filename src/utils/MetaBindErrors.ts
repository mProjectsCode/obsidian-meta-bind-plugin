export class MetaBindInternalError extends Error {
	constructor(message: string) {
		super(`[MB_INTERNAL_ERROR - please report this error here https://github.com/mProjectsCode/obsidian-meta-bind-plugin/issues] ${message}`);
	}
}

export class MetaBindParsingError extends Error {
	constructor(message: string) {
		super(`[MB_PARSING_ERROR] ${message}`);
	}
}

export class MetaBindBindTargetError extends Error {
	constructor(message: string) {
		super(`[MB_BIND_TARGET_ERROR] ${message}`);
	}
}

export class MetaBindValueError extends Error {
	constructor(message: string) {
		super(`[MB_VALUE_ERROR] ${message}`);
	}
}

export class MetaBindArgumentError extends Error {
	constructor(message: string) {
		super(`[MB_ARGUMENT_ERROR] ${message}`);
	}
}

export class MetaBindJsError extends Error {
	constructor(message: string) {
		super(`[MB_JS_ERROR] ${message}`);
	}
}

export class MetaBindExpressionError extends Error {
	constructor(message: string) {
		super(`[MB_EXPRESSION_ERROR] ${message}`);
	}
}

import { ErrorLevel, MetaBindError } from './MetaBindErrors';
import ErrorCollectionComponent from '../../publish/PublishFieldComponent.svelte';

export class ErrorCollection {
	errors: MetaBindError[];
	otherError?: Error;
	subject: string;

	constructor(subject: string) {
		this.subject = subject;
		this.errors = [];
	}

	add(error: any): void {
		if (error instanceof Error) {
			if (error instanceof MetaBindError) {
				this.errors.push(error);
			} else {
				this.otherError = error;
			}
		} else {
			console.warn(`[MB_ERROR_CONTAINER] received invalid error type`, error);
		}
	}

	/**
	 * Merges another error container into this one.
	 *
	 * @param other another error container.
	 */
	merge(other: ErrorCollection): void {
		this.errors = this.errors.concat(other.errors);
		if (other.otherError) {
			this.otherError = other.otherError;
		}
	}

	hasErrors(): boolean {
		if (this.otherError) {
			return true;
		}

		for (const error of this.errors) {
			if (error.errorLevel === ErrorLevel.ERROR || error.errorLevel === ErrorLevel.CRITICAL) {
				return true;
			}
		}

		return false;
	}

	hasCriticalErrors(): boolean {
		if (this.otherError) {
			return true;
		}

		for (const error of this.errors) {
			if (error.errorLevel === ErrorLevel.CRITICAL) {
				return true;
			}
		}

		return false;
	}

	hasWarnings(): boolean {
		for (const error of this.errors) {
			if (error.errorLevel === ErrorLevel.WARNING) {
				return true;
			}
		}

		return false;
	}

	isEmpty(): boolean {
		return this.errors.length === 0 && !this.otherError;
	}

	getErrors(): (MetaBindError | Error)[] {
		const errors: (MetaBindError | Error)[] = this.errors.filter(x => x.errorLevel === ErrorLevel.ERROR || x.errorLevel === ErrorLevel.CRITICAL);
		return this.otherError ? errors.concat([this.otherError]) : errors;
	}

	getWarnings(): (MetaBindError | Error)[] {
		return this.errors.filter(x => x.errorLevel === ErrorLevel.WARNING);
	}
}

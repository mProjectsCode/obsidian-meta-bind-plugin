import { ErrorCollection } from '../../src/utils/errors/ErrorCollection';

declare global {
	namespace jest {
		interface Matchers<R> {
			toHaveWarnings(): R;
			toHaveErrors(): R;
		}

		interface AsymmetricMatchers {
			toHaveWarnings(): void;
			toHaveErrors(): void;
		}
	}
}

export function toHaveWarnings(obj: { errorCollection: ErrorCollection }): { pass: boolean; message: () => string } {
	if (obj.errorCollection.hasWarnings()) {
		return {
			pass: true,
			message: (): string => `expected error collection to have no warnings`,
		};
	} else {
		return {
			pass: false,
			message: (): string => `expected error collection to have warnings`,
		};
	}
}

export function toHaveErrors(obj: { errorCollection: ErrorCollection }): { pass: boolean; message: () => string } {
	if (obj.errorCollection.hasErrors()) {
		return {
			pass: true,
			message: (): string => `expected error collection to have no errors`,
		};
	} else {
		return {
			pass: false,
			message: (): string => `expected error collection to have errors`,
		};
	}
}

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

export function toHaveWarnings(obj: { errorCollection: ErrorCollection }) {
	if (obj.errorCollection.hasWarnings()) {
		return {
			pass: true,
			message: () => `expected error collection to have no warnings`,
		};
	} else {
		return {
			pass: false,
			message: () => `expected error collection to have warnings`,
		};
	}
}

export function toHaveErrors(obj: { errorCollection: ErrorCollection }) {
	if (obj.errorCollection.hasErrors()) {
		return {
			pass: true,
			message: () => `expected error collection to have no warnings`,
		};
	} else {
		return {
			pass: false,
			message: () => `expected error collection to have warnings`,
		};
	}
}

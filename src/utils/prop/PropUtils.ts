import { PropPath } from './PropPath';
import { PropAccessResult } from './PropAccess';

export class PropUtils {
	static get(obj: unknown, path: PropPath): unknown {
		return path.get(obj).child;
	}

	static fullGet(obj: unknown, path: PropPath): PropAccessResult {
		return path.get(obj);
	}

	static set(obj: unknown, path: PropPath, value: unknown): void {
		return path.set(obj, value);
	}

	static setAndCreate(obj: unknown, path: PropPath, value: unknown): void {
		return path.setAndCreate(obj, value);
	}
}

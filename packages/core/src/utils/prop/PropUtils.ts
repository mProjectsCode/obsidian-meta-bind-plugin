import { type PropPath } from 'packages/core/src/utils/prop/PropPath';
import { type PropAccessResult } from 'packages/core/src/utils/prop/PropAccess';

export class PropUtils {
	static get(obj: unknown, path: PropPath): unknown {
		return path.get(obj).child;
	}

	static tryGet(obj: unknown, path: PropPath): unknown {
		return path.tryGet(obj)?.child;
	}

	static fullGet(obj: unknown, path: PropPath): PropAccessResult {
		return path.get(obj);
	}

	static set(obj: unknown, path: PropPath, value: unknown): void {
		path.set(obj, value);
	}

	static setAndCreate(obj: unknown, path: PropPath, value: unknown): void {
		path.setAndCreate(obj, value);
	}
}

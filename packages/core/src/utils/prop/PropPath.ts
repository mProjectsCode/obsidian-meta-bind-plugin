import type { PropAccess, PropAccessResult } from 'packages/core/src/utils/prop/PropAccess';
import { PropAccessType } from 'packages/core/src/utils/prop/PropAccess';

export class PropPath {
	path: PropAccess[];

	constructor(path: PropAccess[]) {
		this.path = path;
	}

	get(obj: unknown): PropAccessResult {
		if (this.path.length === 0) {
			throw new Error('can not use empty path to access object');
		}

		let result = this.path[0].get(obj);

		for (const access of this.path.slice(1)) {
			result = access.get(result.child);
		}

		return result;
	}

	tryGet(obj: unknown): PropAccessResult | undefined {
		try {
			return this.get(obj);
		} catch (_e) {
			return undefined;
		}
	}

	set(obj: unknown, value: unknown): void {
		if (this.path.length === 0) {
			throw new Error('can not use empty path to access object');
		}

		let result = this.path[0].get(obj);

		for (const access of this.path.slice(1)) {
			result = access.get(result.child);
		}

		result.access.set(result.parent, value);
	}

	setAndCreate(obj: unknown, value: unknown): void {
		if (this.path.length === 0) {
			throw new Error('can not use empty path to access object');
		}

		let result = this.path[0].get(obj);

		if (result.child === undefined) {
			result.access.set(result.parent, this.getNextPathElementValue(0, value));
			result = result.access.get(result.parent);
		}

		for (let i = 1; i < this.path.length; i++) {
			const access = this.path[i];
			result = access.get(result.child);

			if (result.child === undefined) {
				result.access.set(result.parent, this.getNextPathElementValue(i, value));
				result = result.access.get(result.parent);
			}
		}

		result.access.set(result.parent, value);
	}

	private getNextPathElement(index: number): PropAccess | undefined {
		return this.path[index + 1];
	}

	private getNextPathElementValue(index: number, value: unknown): unknown {
		const nextPathElement = this.getNextPathElement(index);

		if (nextPathElement === undefined) {
			return value;
		}

		return nextPathElement.type === PropAccessType.OBJECT ? {} : [];
	}

	toStringArray(): string[] {
		return this.path.map(access => access.prop);
	}

	toString(): string {
		return this.toStringArray().join('.');
	}

	concat(path: PropPath): PropPath {
		return new PropPath(this.path.concat(path.path));
	}

	compareDiffArray(path: (string | number)[]): boolean {
		const len = Math.min(this.path.length, path.length);

		for (let i = 0; i < len; i++) {
			const access = this.path[i];
			const pathElement = path[i];

			if (access.prop !== pathElement.toString()) {
				return false;
			}
		}

		return true;
	}
}

import type { UnvalidatedPropAccess } from 'packages/core/src/parsers/bindTargetParser/BindTargetDeclaration';

export enum PropAccessType {
	OBJECT = 'object',
	ARRAY = 'array',
}

export class PropAccessResult {
	parent: unknown;
	access: PropAccess;
	child: unknown;

	constructor(parent: unknown, access: PropAccess, child: unknown) {
		this.parent = parent;
		this.access = access;
		this.child = child;
	}
}

function accessGet(obj: unknown, prop: string): unknown {
	// @ts-ignore
	return obj[prop];
}

function accessSet(obj: unknown, prop: string, value: unknown): void {
	// @ts-ignore
	obj[prop] = value;
}

export class PropAccess {
	type: PropAccessType;
	prop: string;
	index: number;

	constructor(type: PropAccessType, prop: string) {
		this.type = type;
		this.prop = type === PropAccessType.OBJECT ? prop : '';
		this.index = type === PropAccessType.ARRAY ? Number(prop) : 0;

		if (Number.isNaN(this.index)) {
			throw new Error('can not access array with non number index');
		}
	}

	get(obj: unknown): PropAccessResult {
		if (this.type === PropAccessType.OBJECT) {
			if (typeof obj !== 'object' || obj == null) {
				throw new Error('can not access property of non-object');
			}

			return new PropAccessResult(obj, this, accessGet(obj, this.prop));
		} else {
			if (typeof obj !== 'object' || obj == null || !Array.isArray(obj)) {
				throw new Error('can not access property of non-array');
			}

			return new PropAccessResult(obj, this, obj[this.index]);
		}
	}

	set(obj: unknown, value: unknown): void {
		if (this.type === PropAccessType.OBJECT) {
			if (typeof obj !== 'object' || obj == null) {
				throw new Error('can not access property of non-object');
			}

			accessSet(obj, this.prop, value);
		} else {
			if (typeof obj !== 'object' || obj == null || !Array.isArray(obj)) {
				throw new Error('can not access property of non-array');
			}

			obj[this.index] = value;
		}
	}

	create(obj: unknown): void {
		if (this.type === PropAccessType.OBJECT) {
			if (typeof obj !== 'object' || obj == null) {
				throw new Error('can not access property of non-object');
			}

			accessSet(obj, this.prop, undefined);
		} else {
			if (typeof obj !== 'object' || obj == null || !Array.isArray(obj)) {
				throw new Error('can not access property of non-array');
			}

			obj[this.index] = undefined;
		}
	}

	toUnvalidatedPropAccess(): UnvalidatedPropAccess {
		if (this.type === PropAccessType.OBJECT) {
			return {
				type: this.type,
				prop: { value: this.prop },
			};
		} else {
			return {
				type: this.type,
				prop: { value: this.index.toString() },
			};
		}
	}
}

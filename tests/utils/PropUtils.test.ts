import { beforeEach, describe, expect, test } from 'bun:test';
import { PropAccessType, PropAccess } from '../../packages/core/src/utils/prop/PropAccess';
import { PropPath } from '../../packages/core/src/utils/prop/PropPath';
import { PropUtils } from '../../packages/core/src/utils/prop/PropUtils';

describe('PropUtils', () => {
	describe('get', () => {
		const obj = {
			a: {
				b: {
					c: 1,
					d: 2,
				},
				e: [{ f: 3 }, { g: 4 }],
			},
			h: {
				i: {
					j: 5,
					k: 6,
				},
				l: {
					m: 7,
					n: 8,
				},
			},
		};

		describe('should get correct value on valid path', () => {
			test('a', () => {
				const path = new PropPath([new PropAccess(PropAccessType.OBJECT, 'a')]);

				expect(PropUtils.get(obj, path)).toBe(obj.a);
			});

			test('a.b', () => {
				const path = new PropPath([
					new PropAccess(PropAccessType.OBJECT, 'a'),
					new PropAccess(PropAccessType.OBJECT, 'b'),
				]);

				expect(PropUtils.get(obj, path)).toBe(obj.a.b);
			});

			test('a.b.c', () => {
				const path = new PropPath([
					new PropAccess(PropAccessType.OBJECT, 'a'),
					new PropAccess(PropAccessType.OBJECT, 'b'),
					new PropAccess(PropAccessType.OBJECT, 'c'),
				]);

				expect(PropUtils.get(obj, path)).toBe(obj.a.b.c);
			});

			test('h.l.n', () => {
				const path = new PropPath([
					new PropAccess(PropAccessType.OBJECT, 'h'),
					new PropAccess(PropAccessType.OBJECT, 'l'),
					new PropAccess(PropAccessType.OBJECT, 'n'),
				]);

				expect(PropUtils.get(obj, path)).toBe(obj.h.l.n);
			});

			test('a.e[0]', () => {
				const path = new PropPath([
					new PropAccess(PropAccessType.OBJECT, 'a'),
					new PropAccess(PropAccessType.OBJECT, 'e'),
					new PropAccess(PropAccessType.ARRAY, '0'),
				]);

				expect(PropUtils.get(obj, path)).toBe(obj.a.e[0]);
			});

			test('a.e[1].g', () => {
				const path = new PropPath([
					new PropAccess(PropAccessType.OBJECT, 'a'),
					new PropAccess(PropAccessType.OBJECT, 'e'),
					new PropAccess(PropAccessType.ARRAY, '1'),
					new PropAccess(PropAccessType.OBJECT, 'g'),
				]);

				expect(PropUtils.get(obj, path)).toBe(obj.a.e[1].g);
			});
		});

		describe('should return undefined when accessing non existent property', () => {
			test('a.c', () => {
				const path = new PropPath([
					new PropAccess(PropAccessType.OBJECT, 'a'),
					new PropAccess(PropAccessType.OBJECT, 'c'),
				]);

				expect(PropUtils.get(obj, path)).toBe(undefined);
			});

			test('c', () => {
				const path = new PropPath([new PropAccess(PropAccessType.OBJECT, 'c')]);

				expect(PropUtils.get(obj, path)).toBe(undefined);
			});
		});

		describe('should throw an error when accessing non object or array property', () => {
			test('a.c.d', () => {
				const path = new PropPath([
					new PropAccess(PropAccessType.OBJECT, 'a'),
					new PropAccess(PropAccessType.OBJECT, 'c'),
					new PropAccess(PropAccessType.OBJECT, 'd'),
				]);

				expect(() => PropUtils.get(obj, path)).toThrow();
			});

			test('c.d', () => {
				const path = new PropPath([
					new PropAccess(PropAccessType.OBJECT, 'c'),
					new PropAccess(PropAccessType.OBJECT, 'd'),
				]);

				expect(() => PropUtils.get(obj, path)).toThrow();
			});

			test('a.b.c.d', () => {
				const path = new PropPath([
					new PropAccess(PropAccessType.OBJECT, 'a'),
					new PropAccess(PropAccessType.OBJECT, 'b'),
					new PropAccess(PropAccessType.OBJECT, 'c'),
					new PropAccess(PropAccessType.OBJECT, 'd'),
				]);

				expect(() => PropUtils.get(obj, path)).toThrow();
			});
		});
	});

	describe('set', () => {
		let obj = {
			a: {
				b: {
					c: 1,
					d: 2,
				},
				e: [{ f: 3 }, { g: 4 }],
			},
			h: {
				i: {
					j: 5,
					k: 6,
				},
				l: {
					m: 7,
					n: 8,
				},
			},
		};
		let copy = JSON.parse(JSON.stringify(obj));

		beforeEach(() => {
			obj = JSON.parse(JSON.stringify(copy));
		});

		describe('should set value correctly on correct path', () => {
			test('a', () => {
				const path = new PropPath([new PropAccess(PropAccessType.OBJECT, 'a')]);

				PropUtils.set(obj, path, 'test');
				// @ts-ignore
				expect(obj.a).toBe('test');
			});

			test('a.b', () => {
				const path = new PropPath([
					new PropAccess(PropAccessType.OBJECT, 'a'),
					new PropAccess(PropAccessType.OBJECT, 'b'),
				]);

				PropUtils.set(obj, path, 'test');
				// @ts-ignore
				expect(obj.a.b).toBe('test');
			});

			test('a.b.c', () => {
				const path = new PropPath([
					new PropAccess(PropAccessType.OBJECT, 'a'),
					new PropAccess(PropAccessType.OBJECT, 'b'),
					new PropAccess(PropAccessType.OBJECT, 'c'),
				]);

				PropUtils.set(obj, path, 'test');
				// @ts-ignore
				expect(obj.a.b.c).toBe('test');
			});

			test('h.l.n', () => {
				const path = new PropPath([
					new PropAccess(PropAccessType.OBJECT, 'h'),
					new PropAccess(PropAccessType.OBJECT, 'l'),
					new PropAccess(PropAccessType.OBJECT, 'n'),
				]);

				PropUtils.set(obj, path, 'test');
				// @ts-ignore
				expect(obj.h.l.n).toBe('test');
			});

			test('a.e[0]', () => {
				const path = new PropPath([
					new PropAccess(PropAccessType.OBJECT, 'a'),
					new PropAccess(PropAccessType.OBJECT, 'e'),
					new PropAccess(PropAccessType.ARRAY, '0'),
				]);

				PropUtils.set(obj, path, 'test');
				// @ts-ignore
				expect(obj.a.e[0]).toBe('test');
			});

			test('a.e[1].g', () => {
				const path = new PropPath([
					new PropAccess(PropAccessType.OBJECT, 'a'),
					new PropAccess(PropAccessType.OBJECT, 'e'),
					new PropAccess(PropAccessType.ARRAY, '1'),
					new PropAccess(PropAccessType.OBJECT, 'g'),
				]);

				PropUtils.set(obj, path, 'test');
				// @ts-ignore
				expect(obj.a.e[1].g).toBe('test');
			});
		});

		describe('should create new property on correct path', () => {
			test('x', () => {
				const path = new PropPath([new PropAccess(PropAccessType.OBJECT, 'x')]);

				PropUtils.set(obj, path, 'test');
				// @ts-ignore
				expect(obj.x).toBe('test');
			});

			test('a.x', () => {
				const path = new PropPath([
					new PropAccess(PropAccessType.OBJECT, 'a'),
					new PropAccess(PropAccessType.OBJECT, 'x'),
				]);

				PropUtils.set(obj, path, 'test');
				// @ts-ignore
				expect(obj.a.x).toBe('test');
			});

			test('a.b.x', () => {
				const path = new PropPath([
					new PropAccess(PropAccessType.OBJECT, 'a'),
					new PropAccess(PropAccessType.OBJECT, 'b'),
					new PropAccess(PropAccessType.OBJECT, 'x'),
				]);

				PropUtils.set(obj, path, 'test');
				// @ts-ignore
				expect(obj.a.b.x).toBe('test');
			});
		});

		describe('should throw an error when setting a property on a non object or array', () => {
			test('a.c.d', () => {
				const path = new PropPath([
					new PropAccess(PropAccessType.OBJECT, 'a'),
					new PropAccess(PropAccessType.OBJECT, 'c'),
					new PropAccess(PropAccessType.OBJECT, 'd'),
				]);

				expect(() => PropUtils.set(obj, path, 'test')).toThrow();
			});

			test('c.d', () => {
				const path = new PropPath([
					new PropAccess(PropAccessType.OBJECT, 'c'),
					new PropAccess(PropAccessType.OBJECT, 'd'),
				]);

				expect(() => PropUtils.set(obj, path, 'test')).toThrow();
			});

			test('a.b.c.d', () => {
				const path = new PropPath([
					new PropAccess(PropAccessType.OBJECT, 'a'),
					new PropAccess(PropAccessType.OBJECT, 'b'),
					new PropAccess(PropAccessType.OBJECT, 'c'),
					new PropAccess(PropAccessType.OBJECT, 'd'),
				]);

				expect(() => PropUtils.set(obj, path, 'test')).toThrow();
			});
		});
	});

	describe('setAndCreate', () => {
		let obj = {
			a: {
				b: {
					c: 1,
					d: 2,
				},
				e: [{ f: 3 }, { g: 4 }],
			},
			h: {
				i: {
					j: 5,
					k: 6,
				},
				l: {
					m: 7,
					n: 8,
				},
			},
		};
		let copy = JSON.parse(JSON.stringify(obj));

		beforeEach(() => {
			obj = JSON.parse(JSON.stringify(copy));
		});

		describe('should set value correctly on correct path', () => {
			test('a', () => {
				const path = new PropPath([new PropAccess(PropAccessType.OBJECT, 'a')]);

				PropUtils.setAndCreate(obj, path, 'test');
				// @ts-ignore
				expect(obj.a).toBe('test');
			});

			test('a.b', () => {
				const path = new PropPath([
					new PropAccess(PropAccessType.OBJECT, 'a'),
					new PropAccess(PropAccessType.OBJECT, 'b'),
				]);

				PropUtils.setAndCreate(obj, path, 'test');
				// @ts-ignore
				expect(obj.a.b).toBe('test');
			});

			test('a.b.c', () => {
				const path = new PropPath([
					new PropAccess(PropAccessType.OBJECT, 'a'),
					new PropAccess(PropAccessType.OBJECT, 'b'),
					new PropAccess(PropAccessType.OBJECT, 'c'),
				]);

				PropUtils.setAndCreate(obj, path, 'test');
				// @ts-ignore
				expect(obj.a.b.c).toBe('test');
			});

			test('h.l.n', () => {
				const path = new PropPath([
					new PropAccess(PropAccessType.OBJECT, 'h'),
					new PropAccess(PropAccessType.OBJECT, 'l'),
					new PropAccess(PropAccessType.OBJECT, 'n'),
				]);

				PropUtils.setAndCreate(obj, path, 'test');
				// @ts-ignore
				expect(obj.h.l.n).toBe('test');
			});

			test('a.e[0]', () => {
				const path = new PropPath([
					new PropAccess(PropAccessType.OBJECT, 'a'),
					new PropAccess(PropAccessType.OBJECT, 'e'),
					new PropAccess(PropAccessType.ARRAY, '0'),
				]);

				PropUtils.setAndCreate(obj, path, 'test');
				// @ts-ignore
				expect(obj.a.e[0]).toBe('test');
			});

			test('a.e[1].g', () => {
				const path = new PropPath([
					new PropAccess(PropAccessType.OBJECT, 'a'),
					new PropAccess(PropAccessType.OBJECT, 'e'),
					new PropAccess(PropAccessType.ARRAY, '1'),
					new PropAccess(PropAccessType.OBJECT, 'g'),
				]);

				PropUtils.setAndCreate(obj, path, 'test');
				// @ts-ignore
				expect(obj.a.e[1].g).toBe('test');
			});
		});

		describe('should create new property on correct path', () => {
			test('x', () => {
				const path = new PropPath([new PropAccess(PropAccessType.OBJECT, 'x')]);

				PropUtils.setAndCreate(obj, path, 'test');
				// @ts-ignore
				expect(obj.x).toBe('test');
			});

			test('a.x', () => {
				const path = new PropPath([
					new PropAccess(PropAccessType.OBJECT, 'a'),
					new PropAccess(PropAccessType.OBJECT, 'x'),
				]);

				PropUtils.setAndCreate(obj, path, 'test');
				// @ts-ignore
				expect(obj.a.x).toBe('test');
			});

			test('a.b.x', () => {
				const path = new PropPath([
					new PropAccess(PropAccessType.OBJECT, 'a'),
					new PropAccess(PropAccessType.OBJECT, 'b'),
					new PropAccess(PropAccessType.OBJECT, 'x'),
				]);

				PropUtils.setAndCreate(obj, path, 'test');
				// @ts-ignore
				expect(obj.a.b.x).toBe('test');
			});

			test('x.y', () => {
				const path = new PropPath([
					new PropAccess(PropAccessType.OBJECT, 'x'),
					new PropAccess(PropAccessType.OBJECT, 'y'),
				]);

				PropUtils.setAndCreate(obj, path, 'test');
				// @ts-ignore
				expect(obj.x.y).toBe('test');
			});

			test('x.y.z', () => {
				const path = new PropPath([
					new PropAccess(PropAccessType.OBJECT, 'x'),
					new PropAccess(PropAccessType.OBJECT, 'y'),
					new PropAccess(PropAccessType.OBJECT, 'z'),
				]);

				PropUtils.setAndCreate(obj, path, 'test');
				// @ts-ignore
				expect(obj.x.y.z).toBe('test');
			});

			test('x.y[0].z', () => {
				const path = new PropPath([
					new PropAccess(PropAccessType.OBJECT, 'x'),
					new PropAccess(PropAccessType.OBJECT, 'y'),
					new PropAccess(PropAccessType.ARRAY, '0'),
					new PropAccess(PropAccessType.OBJECT, 'z'),
				]);

				PropUtils.setAndCreate(obj, path, 'test');
				// @ts-ignore
				expect(obj.x.y[0].z).toBe('test');
			});
		});

		describe('should throw an error when setting a property on a non object or array', () => {
			test('a.b.c.d', () => {
				const path = new PropPath([
					new PropAccess(PropAccessType.OBJECT, 'a'),
					new PropAccess(PropAccessType.OBJECT, 'b'),
					new PropAccess(PropAccessType.OBJECT, 'c'),
					new PropAccess(PropAccessType.OBJECT, 'd'),
				]);

				expect(() => PropUtils.setAndCreate(obj, path, 'test')).toThrow();
			});
		});
	});
});

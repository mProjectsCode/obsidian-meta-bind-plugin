import { beforeEach, describe, expect, test } from 'bun:test';
import { PropUtils } from '../../packages/core/src/utils/prop/PropUtils';
import { PropPath } from '../../packages/core/src/utils/prop/PropPath';
import { PROP_ACCESS_TYPE, PropAccess } from '../../packages/core/src/utils/prop/PropAccess';

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
				const path = new PropPath([new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'a')]);

				expect(PropUtils.get(obj, path)).toBe(obj.a);
			});

			test('a.b', () => {
				const path = new PropPath([
					new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'a'),
					new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'b'),
				]);

				expect(PropUtils.get(obj, path)).toBe(obj.a.b);
			});

			test('a.b.c', () => {
				const path = new PropPath([
					new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'a'),
					new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'b'),
					new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'c'),
				]);

				expect(PropUtils.get(obj, path)).toBe(obj.a.b.c);
			});

			test('h.l.n', () => {
				const path = new PropPath([
					new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'h'),
					new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'l'),
					new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'n'),
				]);

				expect(PropUtils.get(obj, path)).toBe(obj.h.l.n);
			});

			test('a.e[0]', () => {
				const path = new PropPath([
					new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'a'),
					new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'e'),
					new PropAccess(PROP_ACCESS_TYPE.ARRAY, '0'),
				]);

				expect(PropUtils.get(obj, path)).toBe(obj.a.e[0]);
			});

			test('a.e[1].g', () => {
				const path = new PropPath([
					new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'a'),
					new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'e'),
					new PropAccess(PROP_ACCESS_TYPE.ARRAY, '1'),
					new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'g'),
				]);

				expect(PropUtils.get(obj, path)).toBe(obj.a.e[1].g);
			});
		});

		describe('should return undefined when accessing non existent property', () => {
			test('a.c', () => {
				const path = new PropPath([
					new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'a'),
					new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'c'),
				]);

				expect(PropUtils.get(obj, path)).toBe(undefined);
			});

			test('c', () => {
				const path = new PropPath([new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'c')]);

				expect(PropUtils.get(obj, path)).toBe(undefined);
			});
		});

		describe('should throw an error when accessing non object or array property', () => {
			test('a.c.d', () => {
				const path = new PropPath([
					new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'a'),
					new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'c'),
					new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'd'),
				]);

				expect(() => PropUtils.get(obj, path)).toThrow();
			});

			test('c.d', () => {
				const path = new PropPath([
					new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'c'),
					new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'd'),
				]);

				expect(() => PropUtils.get(obj, path)).toThrow();
			});

			test('a.b.c.d', () => {
				const path = new PropPath([
					new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'a'),
					new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'b'),
					new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'c'),
					new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'd'),
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
				const path = new PropPath([new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'a')]);

				PropUtils.set(obj, path, 'test');
				// @ts-ignore
				expect(obj.a).toBe('test');
			});

			test('a.b', () => {
				const path = new PropPath([
					new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'a'),
					new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'b'),
				]);

				PropUtils.set(obj, path, 'test');
				// @ts-ignore
				expect(obj.a.b).toBe('test');
			});

			test('a.b.c', () => {
				const path = new PropPath([
					new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'a'),
					new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'b'),
					new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'c'),
				]);

				PropUtils.set(obj, path, 'test');
				// @ts-ignore
				expect(obj.a.b.c).toBe('test');
			});

			test('h.l.n', () => {
				const path = new PropPath([
					new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'h'),
					new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'l'),
					new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'n'),
				]);

				PropUtils.set(obj, path, 'test');
				// @ts-ignore
				expect(obj.h.l.n).toBe('test');
			});

			test('a.e[0]', () => {
				const path = new PropPath([
					new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'a'),
					new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'e'),
					new PropAccess(PROP_ACCESS_TYPE.ARRAY, '0'),
				]);

				PropUtils.set(obj, path, 'test');
				// @ts-ignore
				expect(obj.a.e[0]).toBe('test');
			});

			test('a.e[1].g', () => {
				const path = new PropPath([
					new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'a'),
					new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'e'),
					new PropAccess(PROP_ACCESS_TYPE.ARRAY, '1'),
					new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'g'),
				]);

				PropUtils.set(obj, path, 'test');
				// @ts-ignore
				expect(obj.a.e[1].g).toBe('test');
			});
		});

		describe('should create new property on correct path', () => {
			test('x', () => {
				const path = new PropPath([new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'x')]);

				PropUtils.set(obj, path, 'test');
				// @ts-ignore
				expect(obj.x).toBe('test');
			});

			test('a.x', () => {
				const path = new PropPath([
					new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'a'),
					new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'x'),
				]);

				PropUtils.set(obj, path, 'test');
				// @ts-ignore
				expect(obj.a.x).toBe('test');
			});

			test('a.b.x', () => {
				const path = new PropPath([
					new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'a'),
					new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'b'),
					new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'x'),
				]);

				PropUtils.set(obj, path, 'test');
				// @ts-ignore
				expect(obj.a.b.x).toBe('test');
			});
		});

		describe('should throw an error when setting a property on a non object or array', () => {
			test('a.c.d', () => {
				const path = new PropPath([
					new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'a'),
					new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'c'),
					new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'd'),
				]);

				expect(() => PropUtils.set(obj, path, 'test')).toThrow();
			});

			test('c.d', () => {
				const path = new PropPath([
					new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'c'),
					new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'd'),
				]);

				expect(() => PropUtils.set(obj, path, 'test')).toThrow();
			});

			test('a.b.c.d', () => {
				const path = new PropPath([
					new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'a'),
					new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'b'),
					new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'c'),
					new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'd'),
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
				const path = new PropPath([new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'a')]);

				PropUtils.setAndCreate(obj, path, 'test');
				// @ts-ignore
				expect(obj.a).toBe('test');
			});

			test('a.b', () => {
				const path = new PropPath([
					new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'a'),
					new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'b'),
				]);

				PropUtils.setAndCreate(obj, path, 'test');
				// @ts-ignore
				expect(obj.a.b).toBe('test');
			});

			test('a.b.c', () => {
				const path = new PropPath([
					new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'a'),
					new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'b'),
					new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'c'),
				]);

				PropUtils.setAndCreate(obj, path, 'test');
				// @ts-ignore
				expect(obj.a.b.c).toBe('test');
			});

			test('h.l.n', () => {
				const path = new PropPath([
					new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'h'),
					new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'l'),
					new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'n'),
				]);

				PropUtils.setAndCreate(obj, path, 'test');
				// @ts-ignore
				expect(obj.h.l.n).toBe('test');
			});

			test('a.e[0]', () => {
				const path = new PropPath([
					new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'a'),
					new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'e'),
					new PropAccess(PROP_ACCESS_TYPE.ARRAY, '0'),
				]);

				PropUtils.setAndCreate(obj, path, 'test');
				// @ts-ignore
				expect(obj.a.e[0]).toBe('test');
			});

			test('a.e[1].g', () => {
				const path = new PropPath([
					new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'a'),
					new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'e'),
					new PropAccess(PROP_ACCESS_TYPE.ARRAY, '1'),
					new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'g'),
				]);

				PropUtils.setAndCreate(obj, path, 'test');
				// @ts-ignore
				expect(obj.a.e[1].g).toBe('test');
			});
		});

		describe('should create new property on correct path', () => {
			test('x', () => {
				const path = new PropPath([new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'x')]);

				PropUtils.setAndCreate(obj, path, 'test');
				// @ts-ignore
				expect(obj.x).toBe('test');
			});

			test('a.x', () => {
				const path = new PropPath([
					new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'a'),
					new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'x'),
				]);

				PropUtils.setAndCreate(obj, path, 'test');
				// @ts-ignore
				expect(obj.a.x).toBe('test');
			});

			test('a.b.x', () => {
				const path = new PropPath([
					new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'a'),
					new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'b'),
					new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'x'),
				]);

				PropUtils.setAndCreate(obj, path, 'test');
				// @ts-ignore
				expect(obj.a.b.x).toBe('test');
			});

			test('x.y', () => {
				const path = new PropPath([
					new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'x'),
					new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'y'),
				]);

				PropUtils.setAndCreate(obj, path, 'test');
				// @ts-ignore
				expect(obj.x.y).toBe('test');
			});

			test('x.y.z', () => {
				const path = new PropPath([
					new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'x'),
					new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'y'),
					new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'z'),
				]);

				PropUtils.setAndCreate(obj, path, 'test');
				// @ts-ignore
				expect(obj.x.y.z).toBe('test');
			});

			test('x.y[0].z', () => {
				const path = new PropPath([
					new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'x'),
					new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'y'),
					new PropAccess(PROP_ACCESS_TYPE.ARRAY, '0'),
					new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'z'),
				]);

				PropUtils.setAndCreate(obj, path, 'test');
				// @ts-ignore
				expect(obj.x.y[0].z).toBe('test');
			});
		});

		describe('should throw an error when setting a property on a non object or array', () => {
			test('a.b.c.d', () => {
				const path = new PropPath([
					new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'a'),
					new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'b'),
					new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'c'),
					new PropAccess(PROP_ACCESS_TYPE.OBJECT, 'd'),
				]);

				expect(() => PropUtils.setAndCreate(obj, path, 'test')).toThrow();
			});
		});
	});
});

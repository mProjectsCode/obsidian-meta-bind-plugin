/**
 * Clamp
 *
 * @param num
 * @param min
 * @param max
 */
export function clamp(num: number, min: number, max: number): number {
	return Math.min(Math.max(num, min), max);
}

/**
 * Clamp
 *
 * @param num
 * @param min
 * @param max
 */
export function optClamp(num: number | undefined, min: number, max: number): number | undefined {
	return num !== undefined ? Math.min(Math.max(num, min), max) : undefined;
}

export function remapRange(
	old_value: number,
	old_min: number,
	old_max: number,
	new_min: number,
	new_max: number,
): number {
	return ((old_value - old_min) / (old_max - old_min)) * (new_max - new_min) + new_min;
}

/**
 * js can't even implement modulo correctly...
 *
 * @param n
 * @param m
 */
export function mod(n: number, m: number): number {
	return ((n % m) + m) % m;
}

/**
 * Checks if 2 arrays contain equal values, the arrays should have the same datatype. Order of the elements matters.
 *
 * @param arr1
 * @param arr2
 */
export function areArraysEqual<T>(arr1: T[] | undefined, arr2: T[] | undefined): boolean {
	if (arr1 == null && arr2 == null) {
		return true;
	}
	if (arr1 == null || arr2 == null) {
		return false;
	}

	if (arr1.length !== arr2.length) {
		return false;
	}

	for (let i = 0; i < arr1.length; i++) {
		if (arr1[i] !== arr2[i]) {
			return false;
		}
	}

	return true;
}

/**
 * Checks if arr starts with base.
 *
 * @param arr
 * @param base
 */
export function arrayStartsWith<T>(arr: T[], base: T[]): boolean {
	for (let i = 0; i < base.length; i++) {
		if (arr[i] !== base[i]) {
			return false;
		}
	}

	return true;
}

export function isTruthy(value: unknown): boolean {
	return !!value;
}

export function isFalsy(value: unknown): boolean {
	return !value;
}

export function deepFreeze<T extends object>(object: T): Readonly<T> {
	// Retrieve the property names defined on object
	const propNames: (string | symbol)[] = Reflect.ownKeys(object);

	// Freeze properties before freezing self
	for (const name of propNames) {
		// @ts-ignore
		const value: unknown = object[name];

		if ((value && typeof value === 'object') || typeof value === 'function') {
			deepFreeze(value);
		}
	}

	return Object.freeze(object);
}

export function deepCopy<T extends object>(object: T): T {
	return structuredClone(object);
}

export function getUUID(): string {
	return window.crypto.randomUUID();
}

export function isUrl(str: string): boolean {
	try {
		new URL(str);
		return true;
	} catch (_) {
		return false;
	}
}

export function tryParseUrl(str: string): URL | undefined {
	try {
		return new URL(str);
	} catch (_) {
		return undefined;
	}
}

// inspired by https://stackoverflow.com/a/48764436
export class DecimalPrecision {
	static round(value: number, decimalPlaces: number = 0): number {
		const p = Math.pow(10, decimalPlaces || 0);
		const n = value * p * (1 + Number.EPSILON);
		return Math.round(n) / p;
	}

	static ceil(value: number, decimalPlaces: number = 0): number {
		const p = Math.pow(10, decimalPlaces || 0);
		const n = value * p * (1 - Math.sign(value) * Number.EPSILON);
		return Math.ceil(n) / p;
	}

	static floor(value: number, decimalPlaces: number = 0): number {
		const p = Math.pow(10, decimalPlaces || 0);
		const n = value * p * (1 + Math.sign(value) * Number.EPSILON);
		return Math.floor(n) / p;
	}

	static trunc(value: number, decimalPlaces: number = 0): number {
		return value < 0 ? DecimalPrecision.ceil(value, decimalPlaces) : DecimalPrecision.floor(value, decimalPlaces);
	}

	static toFixed(value: number, decimalPlaces: number = 0): string {
		return DecimalPrecision.round(value, decimalPlaces).toFixed(decimalPlaces || 0);
	}
}

export function openURL(link: string): void {
	window.open(link, '_blank');
}

export type Tuple<T> = [T, ...T[]];

export function toEnumeration(
	arr: string[],
	map: (x: string) => string,
	separator: string = ', ',
	lastSeparator: string = 'and',
): string {
	if (arr.length === 0) {
		return '';
	}

	arr = arr.map(map);

	if (arr.length === 1) {
		return arr[0];
	}

	if (arr.length === 2) {
		return `${arr[0]} ${lastSeparator} ${arr[1]}`;
	}

	return `${arr.slice(0, -1).join(separator)} ${lastSeparator} ${arr.slice(-1)}`;
}

export function expectType<T>(_: T): void {
	// no op
}

export function showUnloadedMessage(container: HTMLElement, subject: string): void {
	container.innerHTML = '';
	container.className = '';

	const span = document.createElement('span');
	span.className = 'mb-warning mb-unloaded';
	span.innerText = `[MB_UNLOADED] ${subject}`;

	container.appendChild(span);
}

export class DomHelpers {
	static createElement<K extends keyof HTMLElementTagNameMap>(
		parent: HTMLElement,
		tagName: K,
		options?: {
			text?: string;
			class?: string;
		},
	): HTMLElementTagNameMap[K] {
		const el = document.createElement(tagName);
		if (options?.text) {
			el.innerText = options.text;
		}
		if (options?.class) {
			el.className = options.class;
		}
		parent.appendChild(el);
		return el;
	}

	static addClass(el: HTMLElement, cls: string): void {
		el.classList.add(...cls.split(' '));
	}

	static addClasses(el: HTMLElement, cls: string[]): void {
		el.classList.add(...cls);
	}

	static removeClass(el: HTMLElement, cls: string): void {
		el.classList.remove(...cls.split(' '));
	}

	static hasClass(el: HTMLElement, cls: string): boolean {
		return el.classList.contains(cls);
	}

	static removeAllClasses(el: HTMLElement): void {
		el.className = '';
	}

	static empty(el: HTMLElement): void {
		el.innerHTML = '';
	}
}

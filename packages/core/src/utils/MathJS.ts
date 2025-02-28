import type { MathJsInstance, ConfigOptions } from 'mathjs';
import { create as MathJSCreate, all } from 'mathjs';

export function createMathJS(): MathJsInstance {
	// TODO: we should probably limit the functionality of MathJS
	// we don't need full support for matrices, big numbers and all the other high level stuff
	const options: ConfigOptions = {};
	return MathJSCreate(all, options);
}

import type { MathJsInstance } from 'mathjs';
import { create as MathjsCreate, all } from 'mathjs';

const math = MathjsCreate(all);

export function getMathjsSingleton(): MathJsInstance {
	return math;
}

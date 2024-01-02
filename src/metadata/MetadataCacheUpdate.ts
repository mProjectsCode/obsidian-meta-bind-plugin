import { parseLiteral } from '../utils/Literal';

export interface MetadataCacheUpdate {
	evaluate: boolean;
	value: string;
}

export function evaluateMetadataCacheUpdate(update: MetadataCacheUpdate, current: unknown): unknown {
	if (!update.evaluate) {
		return parseLiteral(update.value);
	}

	// eslint-disable-next-line @typescript-eslint/no-implied-eval
	const func = new Function('x', `return ${update.value};`);

	return func(current);
}

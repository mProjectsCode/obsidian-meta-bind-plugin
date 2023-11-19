import { PropPath } from './PropPath';
import { PROP_ACCESS_TYPE, PropAccess } from './PropAccess';
import { intParser } from '../Literal';

export function parsePropPath(arr: string[]): PropPath {
	return new PropPath(
		arr.map(x => {
			if (intParser.tryParse(x).success) {
				return new PropAccess(PROP_ACCESS_TYPE.ARRAY, x);
			} else {
				return new PropAccess(PROP_ACCESS_TYPE.OBJECT, x);
			}
		}),
	);
}

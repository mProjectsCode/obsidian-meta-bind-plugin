import { PropPath } from 'packages/core/src/utils/prop/PropPath';
import { PROP_ACCESS_TYPE, PropAccess } from 'packages/core/src/utils/prop/PropAccess';
import { intParser } from 'packages/core/src/utils/Literal';

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

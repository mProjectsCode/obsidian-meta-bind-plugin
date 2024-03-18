import { intParser } from 'packages/core/src/utils/Literal';
import { PropAccess, PropAccessType } from 'packages/core/src/utils/prop/PropAccess';
import { PropPath } from 'packages/core/src/utils/prop/PropPath';

export function parsePropPath(arr: string[]): PropPath {
	return new PropPath(
		arr.map(x => {
			if (intParser.tryParse(x).success) {
				return new PropAccess(PropAccessType.ARRAY, x);
			} else {
				return new PropAccess(PropAccessType.OBJECT, x);
			}
		}),
	);
}

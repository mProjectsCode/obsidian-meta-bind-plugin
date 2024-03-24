import { intParser } from 'packages/core/src/utils/Literal';
import { PropAccess, PropAccessType } from 'packages/core/src/utils/prop/PropAccess';
import { PropPath } from 'packages/core/src/utils/prop/PropPath';
import { type UnvalidatedPropAccess } from 'packages/core/src/parsers/bindTargetParser/BindTargetDeclaration';
import { toResultNode } from 'packages/core/src/parsers/nomParsers/GeneralNomParsers';

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

export function parsePropPathUnvalidated(arr: string[]): UnvalidatedPropAccess[] {
	return arr.map(x => {
		if (intParser.tryParse(x).success) {
			return {
				prop: toResultNode(x),
				type: PropAccessType.ARRAY,
			};
		} else {
			return {
				prop: toResultNode(x),
				type: PropAccessType.OBJECT,
			};
		}
	});
}

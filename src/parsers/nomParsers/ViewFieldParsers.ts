import { P } from '@lemons_dev/parsinom/lib/ParsiNOM';
import { Parser } from '@lemons_dev/parsinom/lib/Parser';
import { UnvalidatedBindTargetDeclaration } from '../inputFieldParser/InputFieldDeclaration';
import { P_UTILS } from '@lemons_dev/parsinom/lib/ParserUtils';
import { UnvalidatedJsViewFieldBindTargetMapping, UnvalidatedJsViewFieldDeclaration } from '../ViewFieldDeclarationParser';
import { BIND_TARGET } from './BindTargetParsers';
import { ident } from './GeneralParsers';

const viewFieldMathJS = P.manyNotOf('{}[]').describe('MathJS');

export const VIEW_FIELD_DECLARATION: Parser<(string | UnvalidatedBindTargetDeclaration)[]> = P.sequenceMap(
	(first, other) => {
		return [first, ...other.reduce<(UnvalidatedBindTargetDeclaration | string)[]>((acc, x) => acc.concat(x), [])];
	},
	viewFieldMathJS,
	P.sequence(BIND_TARGET.wrap(P.string('{'), P.string('}')), viewFieldMathJS).many()
);

export const VIEW_FIELD_FULL_DECLARATION: Parser<(string | UnvalidatedBindTargetDeclaration)[]> = P.sequenceMap(
	(_1, _2, declaration, _3) => {
		return declaration;
	},
	P.string('VIEW'),
	P.string('['),
	VIEW_FIELD_DECLARATION,
	P.string(']'),
	P_UTILS.eof()
);

const jsViewFieldBindTargetMapping: Parser<UnvalidatedJsViewFieldBindTargetMapping> = P.sequenceMap(
	(bindTarget, children, _1, name) => {
		return {
			bindTarget: bindTarget,
			listenToChildren: children !== undefined,
			name: name,
		};
	},
	BIND_TARGET.wrap(P.string('{'), P.string('}')),
	P.string(' and children').optional(),
	P.string(' as '),
	ident
);

export const JS_VIEW_FIELD_DECLARATION: Parser<UnvalidatedJsViewFieldDeclaration> = P.sequenceMap(
	(bindTargetMappings, _1, _2, code) => {
		return {
			bindTargetMappings: bindTargetMappings,
			code: code,
		};
	},
	jsViewFieldBindTargetMapping.separateBy(P_UTILS.whitespace()),
	P_UTILS.whitespace(),
	P.string('---'),
	P_UTILS.remaining()
);

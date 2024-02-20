import { type BindTargetDeclaration } from 'packages/core/src/parsers/bindTargetParser/BindTargetDeclaration';

export class BindTargetScope {
	scope: BindTargetDeclaration;

	constructor(scope: BindTargetDeclaration) {
		this.scope = scope;
	}
}

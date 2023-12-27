import { type BindTargetDeclaration } from '../parsers/bindTargetParser/BindTargetDeclaration';

export class BindTargetScope {
	scope: BindTargetDeclaration;

	constructor(scope: BindTargetDeclaration) {
		this.scope = scope;
	}
}

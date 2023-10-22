import { type BindTargetDeclaration } from '../parsers/inputFieldParser/InputFieldDeclaration';

export class BindTargetScope {
	scope: BindTargetDeclaration;

	constructor(scope: BindTargetDeclaration) {
		this.scope = scope;
	}
}

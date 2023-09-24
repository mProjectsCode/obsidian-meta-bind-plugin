import { UnvalidatedInputFieldDeclaration } from './InputFieldDeclarationValidator';

export interface TemplateSupplierTemplate<T> {
	readonly name: string;
	readonly template: Readonly<T>;
}

export interface ITemplateSupplier<T> {
	getTemplate(templateName: string): Readonly<T> | undefined;
}

export class EmptyTemplateSupplier implements ITemplateSupplier<UnvalidatedInputFieldDeclaration> {
	public getTemplate(templateName: string): Readonly<UnvalidatedInputFieldDeclaration> | undefined {
		return undefined;
	}
}

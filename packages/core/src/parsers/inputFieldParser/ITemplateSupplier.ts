import { type UnvalidatedInputFieldDeclaration } from 'packages/core/src/parsers/inputFieldParser/InputFieldDeclaration';

export interface TemplateSupplierTemplate<T> {
	readonly name: string;
	readonly template: Readonly<T>;
}

export interface ITemplateSupplier<T> {
	getTemplate(templateName: string): Readonly<T> | undefined;
}

export class EmptyTemplateSupplier implements ITemplateSupplier<UnvalidatedInputFieldDeclaration> {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public getTemplate(templateName: string): Readonly<UnvalidatedInputFieldDeclaration> | undefined {
		return undefined;
	}
}

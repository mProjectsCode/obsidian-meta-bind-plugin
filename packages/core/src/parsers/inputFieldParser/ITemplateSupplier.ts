export interface TemplateSupplierTemplate<T> {
	readonly name: string;
	readonly template: Readonly<T>;
}

export interface ITemplateSupplier<T> {
	getTemplate(templateName: string): Readonly<T> | undefined;
}

import { type IPlugin } from 'packages/core/src/IPlugin';
import { type InputFieldTemplate } from 'packages/core/src/Settings';
import { InputFieldType } from 'packages/core/src/config/FieldConfigs';
import { InputFieldArgumentContainer } from 'packages/core/src/fields/fieldArguments/inputFieldArguments/InputFieldArgumentContainer';
import { type BindTargetScope } from 'packages/core/src/metadata/BindTargetScope';
import { ParsingValidationError, runParser } from 'packages/core/src/parsers/ParsingError';
import {
	type ITemplateSupplier,
	type TemplateSupplierTemplate,
} from 'packages/core/src/parsers/inputFieldParser/ITemplateSupplier';
import {
	type InputFieldDeclaration,
	type UnvalidatedInputFieldDeclaration,
} from 'packages/core/src/parsers/inputFieldParser/InputFieldDeclaration';
import { InputFieldDeclarationValidator } from 'packages/core/src/parsers/inputFieldParser/InputFieldDeclarationValidator';
import {
	INPUT_FIELD_FULL_DECLARATION,
	TEMPLATE_INPUT_FIELD_FULL_DECLARATION,
} from 'packages/core/src/parsers/nomParsers/InputFieldNomParsers';
import { deepFreeze } from 'packages/core/src/utils/Utils';
import { ErrorCollection } from 'packages/core/src/utils/errors/ErrorCollection';
import { ErrorLevel } from 'packages/core/src/utils/errors/MetaBindErrors';

export type InputFieldDeclarationTemplate = TemplateSupplierTemplate<UnvalidatedInputFieldDeclaration>;

export class InputFieldDeclarationParser implements ITemplateSupplier<UnvalidatedInputFieldDeclaration> {
	plugin: IPlugin;
	templates: InputFieldDeclarationTemplate[];

	constructor(plugin: IPlugin) {
		this.plugin = plugin;
		this.templates = [];
	}

	public parseString(
		fullDeclaration: string,
		filePath: string,
		scope: BindTargetScope | undefined,
	): InputFieldDeclaration {
		const errorCollection = new ErrorCollection('InputFieldParser');

		try {
			let parserResult = runParser(
				INPUT_FIELD_FULL_DECLARATION,
				fullDeclaration,
			) as UnvalidatedInputFieldDeclaration;
			parserResult.fullDeclaration = fullDeclaration;
			parserResult.errorCollection = errorCollection;
			parserResult.arguments = [...parserResult.arguments]; // copy argument array to avoid modifying the original

			parserResult = this.applyTemplate(parserResult);

			const declarationValidator = new InputFieldDeclarationValidator(this.plugin, parserResult, filePath);

			return declarationValidator.validate(scope);
		} catch (e) {
			errorCollection.add(e);
		}

		return {
			fullDeclaration: fullDeclaration,
			inputFieldType: InputFieldType.INVALID,
			bindTarget: undefined,
			argumentContainer: new InputFieldArgumentContainer(),
			errorCollection: errorCollection,
		};
	}

	public parseStringWithoutValidation(fullDeclaration: string): UnvalidatedInputFieldDeclaration {
		const errorCollection = new ErrorCollection('InputFieldParser');

		try {
			const parserResult = runParser(
				INPUT_FIELD_FULL_DECLARATION,
				fullDeclaration,
			) as UnvalidatedInputFieldDeclaration;
			parserResult.fullDeclaration = fullDeclaration;
			parserResult.errorCollection = errorCollection;
			parserResult.arguments = [...parserResult.arguments]; // copy argument array to avoid modifying the original

			return parserResult;
		} catch (e) {
			errorCollection.add(e);
		}

		return {
			fullDeclaration: fullDeclaration,
			inputFieldType: { value: InputFieldType.INVALID },
			bindTarget: undefined,
			arguments: [],
			errorCollection: errorCollection,
		};
	}

	public validateDeclaration(
		unvalidatedDeclaration: UnvalidatedInputFieldDeclaration,
		filePath: string,
		scope: BindTargetScope | undefined,
	): InputFieldDeclaration {
		const declarationValidator = new InputFieldDeclarationValidator(this.plugin, unvalidatedDeclaration, filePath);

		return declarationValidator.validate(scope);
	}

	private parseTemplateString(template: string): UnvalidatedInputFieldDeclaration {
		const errorCollection = new ErrorCollection('InputFieldParser');

		try {
			const parserResult = runParser(
				TEMPLATE_INPUT_FIELD_FULL_DECLARATION,
				template,
			) as UnvalidatedInputFieldDeclaration;
			parserResult.fullDeclaration = template;
			parserResult.errorCollection = errorCollection;
			parserResult.arguments = [...parserResult.arguments]; // copy argument array to avoid modifying the original

			return parserResult;
		} catch (e) {
			errorCollection.add(e);
		}

		return {
			fullDeclaration: template,
			inputFieldType: { value: InputFieldType.INVALID },
			bindTarget: undefined,
			arguments: [],
			errorCollection: errorCollection,
		};
	}

	public parseTemplates(templates: InputFieldTemplate[]): ErrorCollection {
		this.templates = [];
		const errorCollection: ErrorCollection = new ErrorCollection('input field template parser');

		for (const template of templates) {
			const templateDeclaration = this.parseTemplateString(template.declaration);

			errorCollection.merge(templateDeclaration.errorCollection);

			const temp: InputFieldDeclarationTemplate = {
				name: template.name,
				template: templateDeclaration,
			};

			this.templates.push(deepFreeze(temp));
		}

		return errorCollection;
	}

	public getTemplate(templateName: string): Readonly<UnvalidatedInputFieldDeclaration> | undefined {
		return this.templates.find(x => x.name === templateName)?.template;
	}

	public applyTemplate(declaration: UnvalidatedInputFieldDeclaration): UnvalidatedInputFieldDeclaration {
		if (declaration.templateName === undefined) {
			return declaration;
		}

		const template = this.getTemplate(declaration.templateName.value);

		if (template === undefined) {
			declaration.errorCollection.add(
				new ParsingValidationError(
					ErrorLevel.WARNING,
					'Input Field Parser',
					`Invalid template name. Could not find template with name '${declaration.templateName.value}'`,
					declaration.fullDeclaration,
					declaration.templateName.position,
					['https://mprojectscode.github.io/obsidian-meta-bind-plugin-docs/guides/templates/'],
				),
			);

			return declaration;
		}

		return this.plugin.api.inputField.merge(template, declaration);
	}
}

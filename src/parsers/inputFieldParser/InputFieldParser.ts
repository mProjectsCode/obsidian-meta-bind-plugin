import { InputFieldArgumentContainer } from '../../fieldArguments/inputFieldArguments/InputFieldArgumentContainer';
import { ErrorCollection } from '../../utils/errors/ErrorCollection';
import { type IPlugin } from '../../IPlugin';
import { type InputFieldTemplate } from '../../settings/Settings';
import { deepFreeze } from '../../utils/Utils';
import { InputFieldDeclarationValidator } from './InputFieldDeclarationValidator';
import { type ITemplateSupplier, type TemplateSupplierTemplate } from './ITemplateSupplier';
import { INPUT_FIELD_FULL_DECLARATION, TEMPLATE_INPUT_FIELD_FULL_DECLARATION } from '../nomParsers/InputFieldParsers';
import { ParsingValidationError, runParser } from '../ParsingError';
import { ErrorLevel } from '../../utils/errors/MetaBindErrors';
import { type InputFieldDeclaration, type UnvalidatedInputFieldDeclaration } from './InputFieldDeclaration';
import { type BindTargetScope } from '../../metadata/BindTargetScope';
import { InputFieldType } from '../GeneralConfigs';

export type InputFieldDeclarationTemplate = TemplateSupplierTemplate<UnvalidatedInputFieldDeclaration>;

export class InputFieldDeclarationParser implements ITemplateSupplier<UnvalidatedInputFieldDeclaration> {
	plugin: IPlugin;
	templates: InputFieldDeclarationTemplate[];

	constructor(plugin: IPlugin) {
		this.plugin = plugin;
		this.templates = [];
	}

	public parseString(fullDeclaration: string, scope: BindTargetScope | undefined): InputFieldDeclaration {
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

			const declarationValidator = new InputFieldDeclarationValidator(this.plugin, parserResult);

			return declarationValidator.validate(scope);
		} catch (e) {
			errorCollection.add(e);
		}

		return {
			fullDeclaration: fullDeclaration,
			inputFieldType: InputFieldType.INVALID,
			isBound: false,
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
		scope?: BindTargetScope | undefined,
	): InputFieldDeclaration {
		const declarationValidator = new InputFieldDeclarationValidator(this.plugin, unvalidatedDeclaration);

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

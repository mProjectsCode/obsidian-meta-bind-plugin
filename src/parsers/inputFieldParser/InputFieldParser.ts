import { InputFieldArgumentContainer } from '../../fieldArguments/inputFieldArguments/InputFieldArgumentContainer';
import { ErrorCollection } from '../../utils/errors/ErrorCollection';
import { IPlugin } from '../../IPlugin';
import { InputFieldTemplate } from '../../settings/Settings';
import { deepFreeze } from '../../utils/Utils';
import { InputFieldDeclarationValidator } from './InputFieldDeclarationValidator';
import { ITemplateSupplier, TemplateSupplierTemplate } from './ITemplateSupplier';
import { INPUT_FIELD_FULL_DECLARATION, TEMPLATE_INPUT_FIELD_FULL_DECLARATION } from '../nomParsers/InputFieldParsers';
import { ParsingValidationError } from '../ParsingError';
import { ErrorLevel } from '../../utils/errors/MetaBindErrors';
import { InputFieldDeclaration, UnvalidatedInputFieldDeclaration } from './InputFieldDeclaration';
import { InputFieldType } from './InputFieldConfigs';
import { BindTargetScope } from '../../metadata/BindTargetScope';

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
			let parserResult = INPUT_FIELD_FULL_DECLARATION.parse(fullDeclaration) as UnvalidatedInputFieldDeclaration;
			parserResult.fullDeclaration = fullDeclaration;
			parserResult.errorCollection = errorCollection;

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
			const parserResult = INPUT_FIELD_FULL_DECLARATION.parse(fullDeclaration) as UnvalidatedInputFieldDeclaration;
			parserResult.fullDeclaration = fullDeclaration;
			parserResult.errorCollection = errorCollection;

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

	public validateDeclaration(unvalidatedDeclaration: UnvalidatedInputFieldDeclaration, scope?: BindTargetScope | undefined): InputFieldDeclaration {
		const declarationValidator = new InputFieldDeclarationValidator(this.plugin, unvalidatedDeclaration);

		return declarationValidator.validate(scope);
	}

	private parseTemplateString(template: string): UnvalidatedInputFieldDeclaration {
		const errorCollection = new ErrorCollection('InputFieldParser');

		try {
			const parserResult = TEMPLATE_INPUT_FIELD_FULL_DECLARATION.parse(template) as UnvalidatedInputFieldDeclaration;
			parserResult.fullDeclaration = template;
			parserResult.errorCollection = errorCollection;

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
			if (declaration.templateName.position) {
				declaration.errorCollection.add(
					new ParsingValidationError(
						ErrorLevel.WARNING,
						'Input Field Parser',
						`Invalid template name. Could not find template with name '${declaration.templateName.value}'`,
						declaration.fullDeclaration,
						declaration.templateName.position
					)
				);
			} else {
				declaration.errorCollection.add(
					new ParsingValidationError(
						ErrorLevel.WARNING,
						'Input Field Parser',
						`Invalid template name. Could not find template with name '${declaration.templateName.value}'`
					)
				);
			}

			return declaration;
		}

		return this.plugin.api.inputField.merge(template, declaration);
	}
}

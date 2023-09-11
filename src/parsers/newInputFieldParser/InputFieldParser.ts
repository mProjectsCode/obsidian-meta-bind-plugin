import { InputFieldDeclaration, InputFieldType } from '../InputFieldDeclarationParser';
import { InputFieldArgumentContainer } from '../../inputFieldArguments/InputFieldArgumentContainer';
import { ErrorCollection } from '../../utils/errors/ErrorCollection';
import { IPlugin } from '../../IPlugin';
import { InputFieldTemplate } from '../../settings/Settings';
import { deepFreeze } from '../../utils/Utils';
import { InputFieldDeclarationValidator, UnvalidatedInputFieldDeclaration } from './InputFieldDeclarationValidator';
import { ITemplateSupplier, TemplateSupplierTemplate } from './ITemplateSupplier';
import { INPUT_FIELD_FULL_DECLARATION, TEMPLATE_INPUT_FIELD_FULL_DECLARATION } from '../nomParsers/Parsers';

export type InputFieldDeclarationTemplate = TemplateSupplierTemplate<UnvalidatedInputFieldDeclaration>;

export class NewInputFieldDeclarationParser implements ITemplateSupplier<UnvalidatedInputFieldDeclaration> {
	plugin: IPlugin;
	templates: InputFieldDeclarationTemplate[];

	constructor(plugin: IPlugin) {
		this.plugin = plugin;
		this.templates = [];
	}

	public parseString(fullDeclaration: string): InputFieldDeclaration {
		const errorCollection = new ErrorCollection('InputFieldParser');

		try {
			const parserResult = INPUT_FIELD_FULL_DECLARATION.parse(fullDeclaration) as UnvalidatedInputFieldDeclaration;
			parserResult.fullDeclaration = fullDeclaration;
			parserResult.errorCollection = errorCollection;

			const declarationValidator = new InputFieldDeclarationValidator(this.plugin, parserResult);

			return declarationValidator.validate();
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

	public validateDeclaration(unvalidatedDeclaration: UnvalidatedInputFieldDeclaration): InputFieldDeclaration {
		const declarationValidator = new InputFieldDeclarationValidator(this.plugin, unvalidatedDeclaration);

		return declarationValidator.validate();
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
}

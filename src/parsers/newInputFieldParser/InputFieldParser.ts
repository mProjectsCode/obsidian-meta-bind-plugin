import { InputFieldDeclaration, InputFieldType } from '../InputFieldDeclarationParser';
import { InputFieldArgumentContainer } from '../../inputFieldArguments/InputFieldArgumentContainer';
import { ErrorCollection } from '../../utils/errors/ErrorCollection';
import { IPlugin } from '../../IPlugin';
import { InputFieldParsingTreeParser } from './InputFieldParsingTreeParser';
import { InputFieldTokenizer } from './InputFieldTokenizer';
import { InputFieldTemplate } from '../../settings/Settings';
import { deepFreeze } from '../../utils/Utils';
import { InputFieldStructureParser } from './InputFieldStructureParser';
import { InputFieldDeclarationValidator, UnvalidatedInputFieldDeclaration } from './InputFieldDeclarationValidator';
import { ITemplateSupplier, TemplateSupplierTemplate } from './ITemplateSupplier';
import { InputFieldValidationGraphSupplier } from './InputFieldValidationGraphSupplier';

export type InputFieldDeclarationTemplate = TemplateSupplierTemplate<UnvalidatedInputFieldDeclaration>;

export class NewInputFieldDeclarationParser implements ITemplateSupplier<UnvalidatedInputFieldDeclaration> {
	plugin: IPlugin;
	templates: InputFieldDeclarationTemplate[];
	graphSupplier: InputFieldValidationGraphSupplier;

	constructor(plugin: IPlugin) {
		this.plugin = plugin;
		this.templates = [];
		this.graphSupplier = new InputFieldValidationGraphSupplier();
	}

	public parseString(fullDeclaration: string): InputFieldDeclaration {
		const errorCollection = new ErrorCollection('InputFieldParser');

		try {
			const tokenizer = new InputFieldTokenizer(fullDeclaration);
			const tokens = tokenizer.getTokens();
			const parsingTreeParser = new InputFieldParsingTreeParser(fullDeclaration, tokens);
			const parsingTree = parsingTreeParser.parse();
			const structureParser = new InputFieldStructureParser(this, this.graphSupplier, fullDeclaration, tokens, parsingTree, errorCollection);
			const unvalidatedDeclaration = structureParser.parse();
			const declarationValidator = new InputFieldDeclarationValidator(unvalidatedDeclaration);

			return declarationValidator.validate();
		} catch (e) {
			errorCollection.add(e);
		}

		return {
			fullDeclaration: fullDeclaration,
			inputFieldType: InputFieldType.INVALID,
			isBound: false,
			bindTarget: '',
			argumentContainer: new InputFieldArgumentContainer(),
			errorCollection: errorCollection,
		};
	}

	public parseStringWithoutValidation(fullDeclaration: string): UnvalidatedInputFieldDeclaration {
		const errorCollection = new ErrorCollection('InputFieldParser');

		try {
			const tokenizer = new InputFieldTokenizer(fullDeclaration);
			const tokens = tokenizer.getTokens();
			const parsingTreeParser = new InputFieldParsingTreeParser(fullDeclaration, tokens);
			const parsingTree = parsingTreeParser.parse();
			const structureParser = new InputFieldStructureParser(this, this.graphSupplier, fullDeclaration, tokens, parsingTree, errorCollection);

			return structureParser.parse();
		} catch (e) {
			errorCollection.add(e);
		}

		return {
			fullDeclaration: fullDeclaration,
			inputFieldType: { result: InputFieldType.INVALID },
			bindTargetFile: undefined,
			bindTargetPath: undefined,
			arguments: [],
			errorCollection: errorCollection,
		};
	}

	public validateDeclaration(unvalidatedDeclaration: UnvalidatedInputFieldDeclaration): InputFieldDeclaration {
		const declarationValidator = new InputFieldDeclarationValidator(unvalidatedDeclaration);

		return declarationValidator.validate();
	}

	private parseTemplateString(template: string): UnvalidatedInputFieldDeclaration {
		const errorCollection = new ErrorCollection('InputFieldParser');

		try {
			const tokenizer = new InputFieldTokenizer(template);
			const tokens = tokenizer.getTokens();
			const parsingTreeParser = new InputFieldParsingTreeParser(template, tokens);
			const parsingTree = parsingTreeParser.parse();
			const structureParser = new InputFieldStructureParser(this, this.graphSupplier, template, tokens, parsingTree, errorCollection);

			return structureParser.parseAsTemplate();
		} catch (e) {
			errorCollection.add(e);
		}

		return {
			fullDeclaration: template,
			inputFieldType: { result: InputFieldType.INVALID },
			bindTargetFile: undefined,
			bindTargetPath: undefined,
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

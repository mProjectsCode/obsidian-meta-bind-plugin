import type { MetaBind } from 'packages/core/src';
import { InputFieldType } from 'packages/core/src/config/FieldConfigs';
import type { BindTargetScope } from 'packages/core/src/metadata/BindTargetScope';
import type { UnvalidatedBindTargetDeclaration } from 'packages/core/src/parsers/bindTargetParser/BindTargetDeclaration';
import type { UnvalidatedFieldArgument } from 'packages/core/src/parsers/FieldDeclaration';
import type {
	InputFieldDeclaration,
	PartialUnvalidatedInputFieldDeclaration,
	SimpleInputFieldDeclaration,
	UnvalidatedInputFieldDeclaration,
} from 'packages/core/src/parsers/inputFieldParser/InputFieldDeclaration';
import { InputFieldDeclarationValidator } from 'packages/core/src/parsers/inputFieldParser/InputFieldDeclarationValidator';
import type {
	ITemplateSupplier,
	TemplateSupplierTemplate,
} from 'packages/core/src/parsers/inputFieldParser/ITemplateSupplier';
import { toResultNode } from 'packages/core/src/parsers/nomParsers/GeneralNomParsers';
import {
	P_InputFieldDeclaration,
	P_PartialInputFieldDeclaration,
} from 'packages/core/src/parsers/nomParsers/InputFieldNomParsers';
import { ParsingValidationError, runParser } from 'packages/core/src/parsers/ParsingError';
import type { InputFieldTemplate } from 'packages/core/src/Settings';
import { ErrorCollection } from 'packages/core/src/utils/errors/ErrorCollection';
import { ErrorLevel } from 'packages/core/src/utils/errors/MetaBindErrors';
import { deepFreeze } from 'packages/core/src/utils/Utils';

export type InputFieldDeclarationTemplate = TemplateSupplierTemplate<UnvalidatedInputFieldDeclaration>;

export class InputFieldParser implements ITemplateSupplier<UnvalidatedInputFieldDeclaration> {
	mb: MetaBind;
	templates: InputFieldDeclarationTemplate[];

	constructor(mb: MetaBind) {
		this.mb = mb;
		this.templates = [];
	}

	public fromString(declarationString: string): UnvalidatedInputFieldDeclaration {
		const errorCollection = new ErrorCollection('InputField');

		try {
			const parserResult = runParser(P_InputFieldDeclaration, declarationString);

			let declaration = this.partialToFullDeclaration(parserResult, declarationString, errorCollection);
			declaration = this.applyTemplate(declaration);

			return declaration;
		} catch (e) {
			errorCollection.add(e);
		}

		return {
			declarationString: declarationString,
			inputFieldType: { value: InputFieldType.INVALID },
			bindTarget: undefined,
			arguments: [],
			errorCollection: errorCollection,
		};
	}

	public fromStringAndValidate(
		declarationString: string,
		filePath: string,
		scope: BindTargetScope | undefined,
	): InputFieldDeclaration {
		return this.validate(this.fromString(declarationString), filePath, scope);
	}

	/**
	 * Convert a simple declaration to an unvalidated declaration.
	 *
	 * @param simpleDeclaration
	 */
	public fromSimpleDeclaration(simpleDeclaration: SimpleInputFieldDeclaration): UnvalidatedInputFieldDeclaration {
		return {
			declarationString: undefined,
			inputFieldType: toResultNode(simpleDeclaration.inputFieldType),
			bindTarget: this.mb.bindTargetParser.fromExistingDeclaration(simpleDeclaration.bindTarget),
			arguments: (simpleDeclaration.arguments ?? []).map(x => ({
				name: toResultNode(x.name),
				value: x.value.map(y => toResultNode(y)),
			})),
			errorCollection: new ErrorCollection('InputField'),
		};
	}

	public fromSimpleDeclarationAndValidate(
		simpleDeclaration: SimpleInputFieldDeclaration,
		filePath: string,
		scope: BindTargetScope | undefined,
	): InputFieldDeclaration {
		return this.validate(this.fromSimpleDeclaration(simpleDeclaration), filePath, scope);
	}

	/**
	 * Convert a partial unvalidated declaration to a full unvalidated declaration.
	 *
	 * @param unvalidatedDeclaration
	 * @param fullDeclaration
	 * @param errorCollection
	 * @private
	 */
	private partialToFullDeclaration(
		unvalidatedDeclaration: PartialUnvalidatedInputFieldDeclaration,
		fullDeclaration: string | undefined,
		errorCollection: ErrorCollection,
	): UnvalidatedInputFieldDeclaration {
		return {
			...structuredClone(unvalidatedDeclaration),
			declarationString: fullDeclaration,
			errorCollection: errorCollection,
		};
	}

	public validate(
		unvalidatedDeclaration: UnvalidatedInputFieldDeclaration,
		filePath: string,
		scope: BindTargetScope | undefined,
	): InputFieldDeclaration {
		const declarationValidator = new InputFieldDeclarationValidator(this.mb, unvalidatedDeclaration, filePath);

		return declarationValidator.validate(scope);
	}

	/**
	 * Merge two input field declarations.
	 *
	 * @param unvalidatedDeclaration
	 * @param override
	 */
	public merge(
		unvalidatedDeclaration: UnvalidatedInputFieldDeclaration,
		override: UnvalidatedInputFieldDeclaration,
	): UnvalidatedInputFieldDeclaration {
		let bindTarget: UnvalidatedBindTargetDeclaration | undefined;

		if (unvalidatedDeclaration.bindTarget === undefined) {
			bindTarget = override.bindTarget;
		} else {
			bindTarget = unvalidatedDeclaration.bindTarget;
			if (override.bindTarget?.storagePath !== undefined) {
				bindTarget.storagePath = override.bindTarget.storagePath;
			}
			if (override.bindTarget?.storageProp !== undefined) {
				bindTarget.storageProp = override.bindTarget.storageProp;
			}
		}

		return {
			declarationString: override.declarationString,
			inputFieldType: override.inputFieldType ?? unvalidatedDeclaration.inputFieldType,
			bindTarget: bindTarget,
			arguments: override.arguments
				.concat(unvalidatedDeclaration.arguments)
				.reduce<UnvalidatedFieldArgument[]>((arr, currentValue) => {
					// filter out duplicates
					if (arr.find(x => x.name === currentValue.name) === undefined) {
						arr.push(currentValue);
					}
					return arr;
				}, []),
			errorCollection: new ErrorCollection('input field declaration')
				.merge(unvalidatedDeclaration.errorCollection)
				.merge(override.errorCollection),
		};
	}

	// ---
	// Template supplier
	// ---

	private parseTemplateString(template: string): UnvalidatedInputFieldDeclaration {
		const errorCollection = new ErrorCollection('InputFieldParser');

		try {
			const parserResult = runParser(P_PartialInputFieldDeclaration, template);

			return this.partialToFullDeclaration(parserResult, template, errorCollection);
		} catch (e) {
			errorCollection.add(e);
		}

		return {
			declarationString: template,
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
					`Invalid template name. Could not find a template with the name '${declaration.templateName.value}'.`,
					declaration.declarationString,
					declaration.templateName.position,
					['https://mprojectscode.github.io/obsidian-meta-bind-plugin-docs/guides/templates/'],
				),
			);

			return declaration;
		}

		return this.merge(template, declaration);
	}
}

import { ErrorCollection } from '../../utils/errors/ErrorCollection';
import { ParsingValidationError } from '../ParsingError';
import { ErrorLevel } from '../../utils/errors/MetaBindErrors';
import { InputFieldArgumentContainer } from '../../fields/fieldArguments/inputFieldArguments/InputFieldArgumentContainer';
import { type AbstractInputFieldArgument } from '../../fields/fieldArguments/inputFieldArguments/AbstractInputFieldArgument';
import { InputFieldArgumentFactory } from '../../fields/fieldArguments/inputFieldArguments/InputFieldArgumentFactory';
import { type IPlugin } from '../../IPlugin';
import { type InputFieldDeclaration, type UnvalidatedInputFieldDeclaration } from './InputFieldDeclaration';
import { type BindTargetScope } from '../../metadata/BindTargetScope';
import { type ParsingResultNode } from '../nomParsers/GeneralNomParsers';
import { InputFieldArgumentType, InputFieldType } from '../../config/FieldConfigs';
import { type BindTargetDeclaration } from '../bindTargetParser/BindTargetDeclaration';

export class InputFieldDeclarationValidator {
	unvalidatedDeclaration: UnvalidatedInputFieldDeclaration;
	errorCollection: ErrorCollection;
	filePath: string;
	plugin: IPlugin;

	constructor(plugin: IPlugin, unvalidatedDeclaration: UnvalidatedInputFieldDeclaration, filePath: string) {
		this.plugin = plugin;
		this.unvalidatedDeclaration = unvalidatedDeclaration;
		this.filePath = filePath;

		this.errorCollection = new ErrorCollection('input field declaration');
	}

	public validate(scope: BindTargetScope | undefined): InputFieldDeclaration {
		const inputFieldType = this.validateInputFieldType();
		const bindTarget = this.validateBindTarget(scope);
		const argumentContainer = this.validateArguments(inputFieldType);

		const declaration: InputFieldDeclaration = {
			fullDeclaration: this.unvalidatedDeclaration.fullDeclaration,
			inputFieldType: inputFieldType,
			bindTarget: bindTarget,
			argumentContainer: argumentContainer,
			errorCollection: this.errorCollection.merge(this.unvalidatedDeclaration.errorCollection),
		};

		this.checkForDeprecation(declaration);

		return declaration;
	}

	private validateInputFieldType(): InputFieldType {
		const inputFieldType = this.unvalidatedDeclaration.inputFieldType;

		for (const entry of Object.entries(InputFieldType)) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
			if (entry[1] === inputFieldType?.value) {
				return entry[1];
			}
		}

		this.errorCollection.add(
			new ParsingValidationError(
				ErrorLevel.ERROR,
				'Declaration Validator',
				`Encountered invalid identifier. Expected token to be an input field type but received '${inputFieldType?.value}'.`,
				this.unvalidatedDeclaration.fullDeclaration,
				inputFieldType?.position,
			),
		);

		return InputFieldType.INVALID;
	}

	private checkForDeprecation(_declaration: InputFieldDeclaration): void {
		// nothing to check atm
	}

	private validateBindTarget(scope: BindTargetScope | undefined): BindTargetDeclaration | undefined {
		if (this.unvalidatedDeclaration.bindTarget !== undefined) {
			return this.plugin.api.bindTargetParser.validateBindTarget(
				this.unvalidatedDeclaration.fullDeclaration,
				this.unvalidatedDeclaration.bindTarget,
				this.filePath,
				scope,
			);
		} else {
			return undefined;
		}
	}

	private validateArguments(inputFieldType: InputFieldType): InputFieldArgumentContainer {
		const argumentContainer = new InputFieldArgumentContainer();

		for (const argument of this.unvalidatedDeclaration.arguments) {
			const argumentType = this.validateArgumentType(argument.name);
			if (argumentType === InputFieldArgumentType.INVALID) {
				continue;
			}

			const inputFieldArgument: AbstractInputFieldArgument =
				InputFieldArgumentFactory.createInputFieldArgument(argumentType);

			if (!inputFieldArgument.isAllowed(inputFieldType)) {
				this.errorCollection.add(
					new ParsingValidationError(
						ErrorLevel.WARNING,
						'Declaration Validator',
						`Failed to parse input field arguments. Argument "${
							argument.name.value
						}" is only applicable to "${inputFieldArgument.getAllowedFieldsAsString()}" input fields.`,
						this.unvalidatedDeclaration.fullDeclaration,
						argument.name.position,
					),
				);

				continue;
			}

			try {
				inputFieldArgument.parseValue(argument.value);
			} catch (e) {
				this.errorCollection.add(e);
				continue;
			}

			argumentContainer.add(inputFieldArgument);
		}

		try {
			argumentContainer.validate();
		} catch (e) {
			this.errorCollection.add(e);
		}

		return argumentContainer;
	}

	private validateArgumentType(argumentType: ParsingResultNode): InputFieldArgumentType {
		for (const entry of Object.entries(InputFieldArgumentType)) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
			if (entry[1] === argumentType.value) {
				return entry[1];
			}
		}

		this.errorCollection.add(
			new ParsingValidationError(
				ErrorLevel.WARNING,
				'Declaration Validator',
				`Encountered invalid identifier. Expected identifier to be an input field argument type but received '${argumentType.value}'.`,
				this.unvalidatedDeclaration.fullDeclaration,
				argumentType.position,
			),
		);

		return InputFieldArgumentType.INVALID;
	}
}

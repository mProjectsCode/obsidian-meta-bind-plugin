import { ErrorCollection } from '../../utils/errors/ErrorCollection';
import { ParsingValidationError } from '../ParsingError';
import { ErrorLevel } from '../../utils/errors/MetaBindErrors';
import { InputFieldArgumentContainer } from '../../inputFieldArguments/InputFieldArgumentContainer';
import { AbstractInputFieldArgument } from '../../inputFieldArguments/AbstractInputFieldArgument';
import { InputFieldArgumentFactory } from '../../inputFieldArguments/InputFieldArgumentFactory';
import { IPlugin } from '../../IPlugin';
import { BindTargetDeclaration, InputFieldDeclaration, UnvalidatedInputFieldDeclaration } from './InputFieldDeclaration';
import { InputFieldArgumentType, InputFieldType } from '../../inputFields/InputFieldConfigs';
import { BindTargetScope } from '../../metadata/BindTargetScope';
import { ParsingResultNode } from '../nomParsers/GeneralParsers';

export class InputFieldDeclarationValidator {
	unvalidatedDeclaration: UnvalidatedInputFieldDeclaration;
	errorCollection: ErrorCollection;
	plugin: IPlugin;

	constructor(plugin: IPlugin, unvalidatedDeclaration: UnvalidatedInputFieldDeclaration) {
		this.plugin = plugin;
		this.unvalidatedDeclaration = unvalidatedDeclaration;

		this.errorCollection = new ErrorCollection('input field declaration');
	}

	public validate(scope: BindTargetScope | undefined): InputFieldDeclaration {
		const inputFieldType = this.validateInputFieldType();
		const bindTarget = this.validateBindTarget(scope);
		const argumentContainer = this.validateArguments(inputFieldType);

		const declaration: InputFieldDeclaration = {
			fullDeclaration: this.unvalidatedDeclaration.fullDeclaration,
			inputFieldType: inputFieldType,
			isBound: bindTarget !== undefined,
			bindTarget: bindTarget,
			argumentContainer: argumentContainer,
			errorCollection: this.errorCollection.merge(this.unvalidatedDeclaration.errorCollection),
		};

		this.checkForDepracation(declaration);

		return declaration;
	}

	private validateInputFieldType(): InputFieldType {
		const inputFieldType = this.unvalidatedDeclaration.inputFieldType;

		for (const entry of Object.entries(InputFieldType)) {
			if (entry[1] === inputFieldType?.value) {
				return entry[1];
			}
		}

		if (inputFieldType?.position) {
			this.errorCollection.add(
				new ParsingValidationError(
					ErrorLevel.ERROR,
					'Declaration Validator',
					`Encountered invalid identifier. Expected token to be an input field type but received '${inputFieldType.value}'.`,
					this.unvalidatedDeclaration.fullDeclaration,
					inputFieldType.position
				)
			);
		} else {
			this.errorCollection.add(
				new ParsingValidationError(
					ErrorLevel.ERROR,
					'Declaration Validator',
					`Encountered invalid identifier. Expected token to be an input field type but received '${inputFieldType?.value}'.`
				)
			);
		}

		return InputFieldType.INVALID;
	}

	private checkForDepracation(declaration: InputFieldDeclaration): void {
		if (
			declaration.inputFieldType === InputFieldType.DATE_PICKER_DEPRECATED ||
			declaration.inputFieldType === InputFieldType.TEXT_AREA_DEPRECATED ||
			declaration.inputFieldType === InputFieldType.MULTI_SELECT_DEPRECATED
		) {
			if (this.unvalidatedDeclaration.inputFieldType?.position) {
				this.errorCollection.add(
					new ParsingValidationError(
						ErrorLevel.WARNING,
						'Declaration Validator',
						`'${declaration.inputFieldType}' is deprecated, as it has been renamed to be in camel case ('input_field_type' => 'inputFieldType').`,
						this.unvalidatedDeclaration.fullDeclaration,
						this.unvalidatedDeclaration.inputFieldType.position
					)
				);
			} else {
				this.errorCollection.add(
					new ParsingValidationError(
						ErrorLevel.WARNING,
						'Declaration Validator',
						`'${declaration.inputFieldType}' is deprecated, as it has been renamed to be in camel case ('input_field_type' => 'inputFieldType').`
					)
				);
			}
		}
	}

	private validateBindTarget(scope: BindTargetScope | undefined): BindTargetDeclaration | undefined {
		if (this.unvalidatedDeclaration.bindTarget !== undefined) {
			return this.plugin.api.bindTargetParser.validateBindTarget(
				this.unvalidatedDeclaration.fullDeclaration,
				this.unvalidatedDeclaration.bindTarget,
				scope
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

			const inputFieldArgument: AbstractInputFieldArgument = InputFieldArgumentFactory.createInputFieldArgument(argumentType);

			if (!inputFieldArgument.isAllowed(inputFieldType)) {
				if (argument.name.position) {
					this.errorCollection.add(
						new ParsingValidationError(
							ErrorLevel.WARNING,
							'Declaration Validator',
							`Failed to parse input field arguments. Argument "${
								argument.name.value
							}" is only applicable to "${inputFieldArgument.getAllowedInputFieldsAsString()}" input fields.`,
							this.unvalidatedDeclaration.fullDeclaration,
							argument.name.position
						)
					);
				} else {
					this.errorCollection.add(
						new ParsingValidationError(
							ErrorLevel.WARNING,
							'Declaration Validator',
							`Failed to parse input field arguments. Argument "${
								argument.name.value
							}" is only applicable to "${inputFieldArgument.getAllowedInputFieldsAsString()}" input fields.`
						)
					);
				}

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
			if (entry[1] === argumentType.value) {
				return entry[1];
			}
		}

		if (argumentType.position) {
			this.errorCollection.add(
				new ParsingValidationError(
					ErrorLevel.WARNING,
					'Declaration Validator',
					`Encountered invalid identifier. Expected identifier to be an input field argument type but received '${argumentType.value}'.`,
					this.unvalidatedDeclaration.fullDeclaration,
					argumentType.position
				)
			);
		} else {
			this.errorCollection.add(
				new ParsingValidationError(
					ErrorLevel.WARNING,
					'Declaration Validator',
					`Encountered invalid identifier. Expected identifier to be an input field argument type but received '${argumentType.value}'.`
				)
			);
		}

		return InputFieldArgumentType.INVALID;
	}
}

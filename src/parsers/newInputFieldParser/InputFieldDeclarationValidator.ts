import { ErrorCollection } from '../../utils/errors/ErrorCollection';
import { InputFieldArgumentType, InputFieldDeclaration, InputFieldType } from '../InputFieldDeclarationParser';
import { ParsingError } from '../generalParser/ParsingError';
import { ErrorLevel, MetaBindParsingError, MetaBindValidationError } from '../../utils/errors/MetaBindErrors';
import { InputFieldArgumentContainer } from '../../inputFieldArguments/InputFieldArgumentContainer';
import { AbstractInputFieldArgument } from '../../inputFieldArguments/AbstractInputFieldArgument';
import { InputFieldArgumentFactory } from '../../inputFieldArguments/InputFieldArgumentFactory';
import { InputFieldToken, InputFieldTokenType } from './InputFieldTokenizer';
import { StructureParserResult } from '../generalParser/StructureParser';

export type InputFieldStructureParserResult = StructureParserResult<InputFieldTokenType, InputFieldToken>;

export interface UnvalidatedInputFieldDeclaration {
	fullDeclaration: string;
	inputFieldType?: InputFieldStructureParserResult;
	bindTargetFile?: InputFieldStructureParserResult;
	bindTargetPath?: InputFieldStructureParserResult;
	arguments: {
		name: InputFieldStructureParserResult;
		value?: InputFieldStructureParserResult;
	}[];

	errorCollection: ErrorCollection;
}

export class InputFieldDeclarationValidator {
	unvalidatedDeclaration: UnvalidatedInputFieldDeclaration;
	errorCollection: ErrorCollection;

	constructor(unvalidatedDeclaration: UnvalidatedInputFieldDeclaration) {
		this.unvalidatedDeclaration = unvalidatedDeclaration;

		this.errorCollection = new ErrorCollection('input field declaration');
	}

	public validate(): InputFieldDeclaration {
		const inputFieldType = this.validateInputFieldType();
		const bindTarget = this.validateBindTarget();
		// TODO: remove this and pass the object directly into the declaration
		const bindTargetString = bindTarget.file ? bindTarget.file + '#' + bindTarget.path : bindTarget.path;
		const argumentContainer = this.validateArguments(inputFieldType);

		console.log('bind target', this.unvalidatedDeclaration.fullDeclaration, bindTarget, bindTargetString);

		return {
			fullDeclaration: this.unvalidatedDeclaration.fullDeclaration,
			inputFieldType: inputFieldType,
			isBound: bindTargetString !== '',
			bindTarget: bindTargetString,
			argumentContainer: argumentContainer,
			errorCollection: this.errorCollection.merge(this.unvalidatedDeclaration.errorCollection),
		};
	}

	private validateInputFieldType(): InputFieldType {
		const inputFieldType = this.unvalidatedDeclaration.inputFieldType;

		for (const entry of Object.entries(InputFieldType)) {
			if (entry[1] === inputFieldType?.result) {
				return entry[1];
			}
		}

		if (inputFieldType?.ptElement) {
			this.errorCollection.add(
				new ParsingError(
					ErrorLevel.ERROR,
					'failed to parse',
					`Encountered invalid token. Expected token to be an input field type but received '${inputFieldType}'.`,
					{},
					inputFieldType.ptElement.str,
					inputFieldType.ptElement.getToken(),
					'Declaration Validator'
				)
			);
		} else {
			this.errorCollection.add(
				new MetaBindValidationError(
					ErrorLevel.ERROR,
					'failed to parse',
					`Encountered invalid token. Expected token to be an input field type but received '${inputFieldType}'.`,
					{}
				)
			);
		}

		return InputFieldType.INVALID;
	}

	private validateBindTarget(): { file: string; path: string } {
		return {
			file: this.unvalidatedDeclaration.bindTargetFile?.result ?? '',
			path: this.unvalidatedDeclaration.bindTargetPath?.result ?? '',
		};
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
				this.errorCollection.add(
					new MetaBindParsingError(
						ErrorLevel.WARNING,
						'failed to parse input field arguments',
						`argument "${argument.name.result}" is only applicable to "${inputFieldArgument.getAllowedInputFieldsAsString()}" input fields`
					)
				);
				continue;
			}

			if (inputFieldArgument.requiresValue) {
				if (!argument.value) {
					if (argument.name.ptElement) {
						this.errorCollection.add(
							new ParsingError(
								ErrorLevel.WARNING,
								'failed to parse input field arguments',
								`argument "${argument.name.result}" requires a non empty value`,
								{},
								argument.name.ptElement.str,
								argument.name.ptElement.getToken(),
								'Declaration Validator'
							)
						);
					} else {
						this.errorCollection.add(
							new MetaBindValidationError(
								ErrorLevel.WARNING,
								'failed to parse input field arguments',
								`argument "${argument.name.result}" requires a non empty value`
							)
						);
					}

					continue;
				}

				try {
					inputFieldArgument.parseValue(argument.value.result);
				} catch (e) {
					this.errorCollection.add(e);
					// TODO: better error message/handling
					continue;
				}
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

	private validateArgumentType(argumentType: InputFieldStructureParserResult): InputFieldArgumentType {
		for (const entry of Object.entries(InputFieldArgumentType)) {
			if (entry[1] === argumentType.result) {
				return entry[1];
			}
		}

		if (argumentType.ptElement) {
			this.errorCollection.add(
				new ParsingError(
					ErrorLevel.WARNING,
					'failed to parse',
					`Encountered invalid token. Expected token to be an input field argument type but received '${argumentType.result}'.`,
					{},
					argumentType.ptElement.str,
					argumentType.ptElement.getToken(),
					'Declaration Validator'
				)
			);
		} else {
			this.errorCollection.add(
				new MetaBindValidationError(
					ErrorLevel.WARNING,
					'failed to parse',
					`Encountered invalid token. Expected token to be an input field argument type but received '${argumentType.result}'.`,
					{}
				)
			);
		}

		return InputFieldArgumentType.INVALID;
	}
}

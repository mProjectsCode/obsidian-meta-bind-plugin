import { EnclosingPair, ParserUtils } from '../utils/ParserUtils';
import { isTruthy, MetaBindParsingError } from '../utils/Utils';
import { InputFieldArgumentFactory } from '../inputFieldArguments/InputFieldArgumentFactory';
import { InputFieldArgumentContainer } from '../inputFieldArguments/InputFieldArgumentContainer';
import { AbstractInputFieldArgument } from 'src/inputFieldArguments/AbstractInputFieldArgument';

export enum InputFieldType {
	TOGGLE = 'toggle',
	SLIDER = 'slider',
	TEXT = 'text',
	TEXT_AREA = 'text_area',
	SELECT = 'select',
	MULTI_SELECT = 'multi_select',
	DATE = 'date',
	TIME = 'time',
	DATE_PICKER = 'date_picker',
	INVALID = 'invalid',
}

export enum InputFieldArgumentType {
	CLASS = 'class',
	ADD_LABELS = 'addLabels',
	MIN_VALUE = 'minValue',
	MAX_VALUE = 'maxValue',
	OPTION = 'option',
	TITLE = 'title',
	ALIGN_RIGHT = 'alignRight',

	INVALID = 'invalid',
}

export interface InputFieldDeclaration {
	fullDeclaration: string;
	declaration: string;
	inputFieldType: InputFieldType;
	isBound: boolean;
	bindTarget: string;
	argumentContainer: InputFieldArgumentContainer;
}

export interface Template {
	identifier: string;
	template: InputFieldDeclaration;
}

export class InputFieldDeclarationParser {
	static roundBracesPair: EnclosingPair = new EnclosingPair('(', ')');
	static squareBracesPair: EnclosingPair = new EnclosingPair('[', ']');
	static curlyBracesPair: EnclosingPair = new EnclosingPair('{', '}');
	static allBracesPairs: EnclosingPair[] = [
		InputFieldDeclarationParser.roundBracesPair,
		InputFieldDeclarationParser.squareBracesPair,
		InputFieldDeclarationParser.curlyBracesPair,
	];

	static templates: Template[] = [];

	static parseDeclaration(
		fullDeclaration: InputFieldDeclaration,
		inputFieldArguments: Record<InputFieldArgumentType, string> | {} | undefined | null = undefined,
		templateName: string | undefined | null = undefined
	): InputFieldDeclaration {
		// field type check
		fullDeclaration.inputFieldType = InputFieldDeclarationParser.getInputFieldType(fullDeclaration.inputFieldType);

		// template check:
		let useTemplate = isTruthy(templateName) && typeof templateName === 'string';
		if (useTemplate) {
			const template = InputFieldDeclarationParser.templates.filter(x => x.identifier === templateName).first()?.template;
			if (template) {
				fullDeclaration.bindTarget = fullDeclaration.bindTarget || template.bindTarget;
				fullDeclaration.isBound = fullDeclaration.isBound || template.isBound;
				fullDeclaration.inputFieldType =
					fullDeclaration.inputFieldType === InputFieldType.INVALID ? template.inputFieldType : fullDeclaration.inputFieldType || template.inputFieldType;
				fullDeclaration.argumentContainer = template.argumentContainer.mergeByOverride(fullDeclaration.argumentContainer);
			} else {
				throw new MetaBindParsingError(`unknown template name \'${templateName}\'`);
			}
		}

		if (fullDeclaration.inputFieldType === InputFieldType.INVALID) {
			throw new MetaBindParsingError(`unknown input field type`);
		}

		// arguments check:
		fullDeclaration.argumentContainer = new InputFieldArgumentContainer();
		if (inputFieldArguments) {
			for (const inputFieldArgumentIdentifier in Object.keys(inputFieldArguments)) {
				const inputFieldArgument: AbstractInputFieldArgument = InputFieldArgumentFactory.createInputFieldArgument(inputFieldArgumentIdentifier);

				if (!inputFieldArgument.isAllowed(fullDeclaration.inputFieldType)) {
					throw new MetaBindParsingError(
						`argument \'${inputFieldArgumentIdentifier}\' is only applicable to ${inputFieldArgument.getAllowedInputFieldsAsString()} input fields`
					);
				}

				if (inputFieldArgument.requiresValue) {
					inputFieldArgument.parseValue((inputFieldArguments as Record<InputFieldArgumentType, string>)[inputFieldArgumentIdentifier as InputFieldArgumentType]);
				}

				fullDeclaration.argumentContainer.add(inputFieldArgument);
			}

			fullDeclaration.argumentContainer.validate();
		}

		return fullDeclaration;
	}

	static parseString(fullDeclaration: string): InputFieldDeclaration {
		let inputFieldDeclaration: InputFieldDeclaration = {} as InputFieldDeclaration;

		let useTemplate = false;
		let templateName = '';

		// declaration
		inputFieldDeclaration.fullDeclaration = fullDeclaration;
		const temp = ParserUtils.getInBetween(fullDeclaration, InputFieldDeclarationParser.squareBracesPair);
		if (Array.isArray(temp)) {
			if (temp.length === 2) {
				useTemplate = true;
				templateName = temp[0];
				inputFieldDeclaration.declaration = temp[1];
			} else {
				throw new MetaBindParsingError('invalid input field declaration');
			}
		} else {
			inputFieldDeclaration.declaration = temp;
		}

		// declaration parts
		const declarationParts: string[] = ParserUtils.split(inputFieldDeclaration.declaration, ':', InputFieldDeclarationParser.squareBracesPair);

		// bind target
		inputFieldDeclaration.bindTarget = declarationParts[1] ?? '';
		inputFieldDeclaration.isBound = isTruthy(inputFieldDeclaration.bindTarget);

		// input field type and arguments
		const inputFieldTypeWithArguments: string = declarationParts[0];
		if (inputFieldTypeWithArguments) {
			// input field type
			const inputFieldTypeString = ParserUtils.removeInBetween(inputFieldTypeWithArguments, InputFieldDeclarationParser.roundBracesPair);
			inputFieldDeclaration.inputFieldType = InputFieldDeclarationParser.getInputFieldType(inputFieldTypeString);

			// arguments
			const inputFieldArgumentsString: string = ParserUtils.getInBetween(inputFieldTypeWithArguments, InputFieldDeclarationParser.roundBracesPair) as string;
			// console.log(inputFieldArgumentsString);
			if (inputFieldArgumentsString) {
				inputFieldDeclaration.argumentContainer = InputFieldDeclarationParser.parseArguments(inputFieldArgumentsString, inputFieldDeclaration.inputFieldType);
			} else {
				inputFieldDeclaration.argumentContainer = new InputFieldArgumentContainer();
			}
		} else {
			inputFieldDeclaration.inputFieldType = InputFieldType.INVALID;
			inputFieldDeclaration.argumentContainer = new InputFieldArgumentContainer();
		}

		if (useTemplate) {
			// console.log(templateName);
			const template = InputFieldDeclarationParser.templates.filter(x => x.identifier === templateName).first()?.template;
			// console.log(template);
			if (template) {
				inputFieldDeclaration.bindTarget = inputFieldDeclaration.bindTarget || template.bindTarget;
				inputFieldDeclaration.isBound = inputFieldDeclaration.isBound || template.isBound;
				inputFieldDeclaration.inputFieldType =
					inputFieldDeclaration.inputFieldType === InputFieldType.INVALID ? template.inputFieldType : inputFieldDeclaration.inputFieldType || template.inputFieldType;
				inputFieldDeclaration.argumentContainer = template.argumentContainer.mergeByOverride(inputFieldDeclaration.argumentContainer);
			} else {
				throw new MetaBindParsingError(`unknown template name \'${templateName}\'`);
			}
		}

		if (inputFieldDeclaration.inputFieldType === InputFieldType.INVALID) {
			throw new MetaBindParsingError(`unknown input field type`);
		}

		return inputFieldDeclaration;
	}

	static parseTemplates(templates: string): void {
		let templateDeclarations = templates ? ParserUtils.split(templates, '\n', InputFieldDeclarationParser.squareBracesPair) : [];
		templateDeclarations = templateDeclarations.map(x => x.trim()).filter(x => x.length > 0);

		for (const templateDeclaration of templateDeclarations) {
			let templateDeclarationParts: string[] = ParserUtils.split(templateDeclaration, '->', InputFieldDeclarationParser.squareBracesPair);
			templateDeclarationParts = templateDeclarationParts.map(x => x.trim());

			if (templateDeclarationParts.length === 1) {
				throw new MetaBindParsingError('Invalid template syntax');
			} else if (templateDeclarationParts.length === 2) {
				InputFieldDeclarationParser.templates.push({
					identifier: templateDeclarationParts[0],
					template: InputFieldDeclarationParser.parseString(templateDeclarationParts[1]),
				});
			}
		}

		console.log(InputFieldDeclarationParser.templates);
	}

	static parseArguments(inputFieldArgumentsString: string, inputFieldType: InputFieldType): InputFieldArgumentContainer {
		// console.log('inputFieldArgumentsString', inputFieldArgumentsString);
		let inputFieldArgumentStrings: string[] = ParserUtils.split(inputFieldArgumentsString, ',', InputFieldDeclarationParser.roundBracesPair);
		inputFieldArgumentStrings = inputFieldArgumentStrings.map(x => x.trim());

		const inputFieldArgumentContainer: InputFieldArgumentContainer = new InputFieldArgumentContainer();

		for (const inputFieldArgumentString of inputFieldArgumentStrings) {
			const inputFieldArgumentIdentifier: string = InputFieldDeclarationParser.extractInputFieldArgumentIdentifier(inputFieldArgumentString);
			// console.log(inputFieldArgumentIdentifier);

			const inputFieldArgument = InputFieldArgumentFactory.createInputFieldArgument(inputFieldArgumentIdentifier);

			if (!inputFieldArgument.isAllowed(inputFieldType)) {
				throw new MetaBindParsingError(
					`argument \'${inputFieldArgumentIdentifier}\' is only applicable to ${inputFieldArgument.getAllowedInputFieldsAsString()} input fields`
				);
			}

			if (inputFieldArgument.requiresValue) {
				inputFieldArgument.parseValue(InputFieldDeclarationParser.extractInputFieldArgumentValue(inputFieldArgumentString));
			}

			inputFieldArgumentContainer.add(inputFieldArgument);
		}

		inputFieldArgumentContainer.validate();

		return inputFieldArgumentContainer;
	}

	static extractInputFieldArgumentIdentifier(argumentString: string): string {
		return ParserUtils.removeInBetween(argumentString, InputFieldDeclarationParser.roundBracesPair);
	}

	static extractInputFieldArgumentValue(argumentString: string): string {
		const argumentName = this.extractInputFieldArgumentIdentifier(argumentString);

		const argumentValue = ParserUtils.getInBetween(argumentString, InputFieldDeclarationParser.roundBracesPair) as string;
		if (!argumentValue) {
			throw new MetaBindParsingError(`argument \'${argumentName}\' requires a non empty value`);
		}

		return argumentValue;
	}

	static getInputFieldType(str: string): InputFieldType {
		for (const entry of Object.entries(InputFieldType)) {
			if (entry[1] === str) {
				return entry[1];
			}
		}

		return InputFieldType.INVALID;
	}

	static applyTemplate(fullDeclaration: InputFieldDeclaration, templateName: string | null | undefined) {
		const template = InputFieldDeclarationParser.templates.filter(x => x.identifier === templateName).first()?.template;
		if (template) {
			fullDeclaration.bindTarget = fullDeclaration.bindTarget || template.bindTarget;
			fullDeclaration.isBound = fullDeclaration.isBound || template.isBound;
			fullDeclaration.inputFieldType = fullDeclaration.inputFieldType === InputFieldType.INVALID ? template.inputFieldType : fullDeclaration.inputFieldType || template.inputFieldType;
			fullDeclaration.argumentContainer = template.argumentContainer.mergeByOverride(fullDeclaration.argumentContainer);
		} else {
			throw new MetaBindParsingError(`unknown template name \'${templateName}\'`);
		}
	}
}

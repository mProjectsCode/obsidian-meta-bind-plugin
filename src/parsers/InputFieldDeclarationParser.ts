import {EnclosingPair, ParserUtils} from '../utils/ParserUtils';
import {isTruthy, MetaBindParsingError} from '../utils/Utils';

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

export interface InputFieldDeclaration {
	fullDeclaration: string;
	declaration: string;
	inputFieldType: InputFieldType;
	isBound: boolean;
	bindTarget: string;

	arguments: InputFieldArgument[];
}

export interface InputFieldArgument {
	name: string;
	value: any;
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

	static templates: Record<string, InputFieldDeclaration> = {};


	static parse(fullDeclaration: string, templateName?: string): InputFieldDeclaration {
		let inputFieldDeclaration: InputFieldDeclaration = {} as InputFieldDeclaration;

		// declaration
		inputFieldDeclaration.fullDeclaration = fullDeclaration;
		inputFieldDeclaration.declaration = ParserUtils.getInBetween(fullDeclaration, InputFieldDeclarationParser.squareBracesPair) as string;

		// declaration parts
		const declarationParts: string[] = ParserUtils.split(inputFieldDeclaration.declaration, ':', InputFieldDeclarationParser.squareBracesPair);

		// bind target
		inputFieldDeclaration.bindTarget = declarationParts[1] ?? '';
		inputFieldDeclaration.isBound = isTruthy(inputFieldDeclaration.bindTarget);

		// input field type and arguments
		const inputFieldTypeWithArguments: string = declarationParts[0];
		// input field type
		const inputFieldTypeString = ParserUtils.removeInBetween(inputFieldTypeWithArguments, InputFieldDeclarationParser.roundBracesPair);
		inputFieldDeclaration.inputFieldType = InputFieldDeclarationParser.getInputFieldType(inputFieldTypeString);

		// arguments
		const inputFieldArgumentsString: string = ParserUtils.getInBetween(inputFieldTypeWithArguments, InputFieldDeclarationParser.roundBracesPair) as string;
		// console.log(inputFieldArgumentsString);
		if (inputFieldArgumentsString) {
			inputFieldDeclaration.arguments = InputFieldDeclarationParser.parseArguments(inputFieldArgumentsString, inputFieldDeclaration.inputFieldType);
		} else {
			inputFieldDeclaration.arguments = [];
		}


		if (templateName) {
			const template = InputFieldDeclarationParser.templates[templateName];
			if (template) {
				inputFieldDeclaration.bindTarget = inputFieldDeclaration.bindTarget || template.bindTarget;
				inputFieldDeclaration.isBound = inputFieldDeclaration.isBound || template.isBound;
				inputFieldDeclaration.inputFieldType = inputFieldDeclaration.inputFieldType === InputFieldType.INVALID ? template.inputFieldType : (inputFieldDeclaration.inputFieldType || template.inputFieldType);
				inputFieldDeclaration.arguments = inputFieldDeclaration.arguments.concat(template.arguments);
			}
		}

		if (inputFieldDeclaration.inputFieldType === InputFieldType.INVALID) {
			throw new MetaBindParsingError(`unknown input field type \'${inputFieldTypeString}\'`);
		}

		return inputFieldDeclaration;
	}

	static parseTemplates(templates: string): void {
		let templateDeclarations = ParserUtils.split(templates, '\n', InputFieldDeclarationParser.squareBracesPair);
		templateDeclarations.map(x => x.trim()).filter(x => x.length > 0);

		for (const templateDeclaration of templateDeclarations) {
			const templateDeclarationParts: string[] = ParserUtils.split(templateDeclaration, '->', InputFieldDeclarationParser.squareBracesPair);
			templateDeclarationParts.map(x => x.trim());

			if (templateDeclarationParts.length === 1) {
				throw new MetaBindParsingError('Invalid template syntax');
			} else if (templateDeclarationParts.length === 2) {
				InputFieldDeclarationParser.templates[templateDeclarationParts[0]] = InputFieldDeclarationParser.parse(templateDeclarationParts[1]);
			}
		}
	}

	static parseArguments(inputFieldArgumentsString: string, inputFieldType: InputFieldType): InputFieldArgument[] {
		// console.log('inputFieldArgumentsString', inputFieldArgumentsString);
		let inputFieldArgumentStrings: string[] = ParserUtils.split(inputFieldArgumentsString, ',', InputFieldDeclarationParser.roundBracesPair);
		inputFieldArgumentStrings = inputFieldArgumentStrings.map(x => x.trim());

		const inputFieldArguments: InputFieldArgument[] = [];

		for (const inputFieldArgumentString of inputFieldArgumentStrings) {
			const inputFieldArgumentName: string = InputFieldDeclarationParser.extractInputFieldArgumentName(inputFieldArgumentString);
			// console.log(inputFieldArgumentName);

			if (inputFieldArgumentName === 'class') {
				const inputFieldArgumentValue: string = InputFieldDeclarationParser.extractInputFieldArgumentValue(inputFieldArgumentString);

				const inputFieldClassArgument: InputFieldArgument = {name: inputFieldArgumentName, value: inputFieldArgumentValue};
				inputFieldArguments.push(inputFieldClassArgument);
			} else if (inputFieldArgumentName === 'addLabels') {
				if (inputFieldType !== InputFieldType.SLIDER) {
					throw new MetaBindParsingError(`argument \'${inputFieldArgumentName}\' is only applicable to slider input fields`);
				}

				inputFieldArguments.push({name: 'labels', value: true});
			} else if (inputFieldArgumentName === 'minValue') {
				if (inputFieldType !== InputFieldType.SLIDER) {
					throw new MetaBindParsingError(`argument \'${inputFieldArgumentName}\' is only applicable to slider input fields`);
				}

				const inputFieldArgumentValue: string = InputFieldDeclarationParser.extractInputFieldArgumentValue(inputFieldArgumentString);
				const inputFieldArgumentValueAsNumber: number = Number.parseInt(inputFieldArgumentValue);

				if (Number.isNaN(inputFieldArgumentValueAsNumber)) {
					throw new MetaBindParsingError(`argument \'${inputFieldArgumentName}\' value must be of type number`);
				}

				const inputFieldArgumentObject: InputFieldArgument = {name: inputFieldArgumentName, value: inputFieldArgumentValueAsNumber};
				inputFieldArguments.push(inputFieldArgumentObject);
			} else if (inputFieldArgumentName === 'maxValue') {
				if (inputFieldType !== InputFieldType.SLIDER) {
					throw new MetaBindParsingError(`argument \'${inputFieldArgumentName}\' is only applicable to slider input fields`);
				}

				const inputFieldArgumentValue: string = InputFieldDeclarationParser.extractInputFieldArgumentValue(inputFieldArgumentString);
				const inputFieldArgumentValueAsNumber: number = Number.parseInt(inputFieldArgumentValue);

				if (Number.isNaN(inputFieldArgumentValueAsNumber)) {
					throw new MetaBindParsingError(`argument \'${inputFieldArgumentName}\' value must be of type number`);
				}

				const inputFieldArgumentObject: InputFieldArgument = {name: inputFieldArgumentName, value: inputFieldArgumentValueAsNumber};
				inputFieldArguments.push(inputFieldArgumentObject);
			} else if (inputFieldArgumentName === 'option') {
				if (inputFieldType !== InputFieldType.SELECT && inputFieldType !== InputFieldType.MULTI_SELECT) {
					throw new MetaBindParsingError(`argument \'${inputFieldArgumentName}\' is only applicable to select and multi-select input fields`);
				}

				const inputFieldArgumentValue: string = InputFieldDeclarationParser.extractInputFieldArgumentValue(inputFieldArgumentString);

				const inputFieldArgumentObject: InputFieldArgument = {name: inputFieldArgumentName, value: inputFieldArgumentValue};
				inputFieldArguments.push(inputFieldArgumentObject);
			} else if (inputFieldArgumentName === 'title') {
				if (inputFieldType !== InputFieldType.SELECT && inputFieldType !== InputFieldType.MULTI_SELECT) {
					throw new MetaBindParsingError(`argument \'${inputFieldArgumentName}\' is only applicable to select and multi-select input fields`);
				}

				const inputFieldArgumentValue: string = InputFieldDeclarationParser.extractInputFieldArgumentValue(inputFieldArgumentString);

				const inputFieldArgumentObject: InputFieldArgument = {name: inputFieldArgumentName, value: inputFieldArgumentValue};
				inputFieldArguments.push(inputFieldArgumentObject);
			} else {
				throw new MetaBindParsingError(`unknown argument \'${inputFieldArgumentName}\'`);
			}
		}

		return inputFieldArguments;
	}

	static extractInputFieldArgumentName(argumentString: string): string {
		return ParserUtils.removeInBetween(argumentString, InputFieldDeclarationParser.roundBracesPair);
	}

	static extractInputFieldArgumentValue(argumentString: string): string {
		const argumentName = this.extractInputFieldArgumentName(argumentString);

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

}

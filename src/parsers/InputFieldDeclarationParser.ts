import {InputFieldFactory, InputFieldType} from '../inputFields/InputFieldFactory';
import {EnclosingPair, ParserUtils} from '../utils/ParserUtils';
import {isTruthy, MetaBindParsingError} from '../utils/Utils';

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


	static parse(fullDeclaration: string): InputFieldDeclaration {
		const inputFieldDeclaration: InputFieldDeclaration = {} as InputFieldDeclaration;

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
		inputFieldDeclaration.inputFieldType = InputFieldFactory.getInputFieldType(inputFieldTypeString);
		if (inputFieldDeclaration.inputFieldType === InputFieldType.INVALID) {
			throw new MetaBindParsingError(`Unknown input field type \'${inputFieldTypeString}\'`);
		}
		// arguments
		const inputFieldArgumentsString: string = ParserUtils.getInBetween(inputFieldTypeWithArguments, InputFieldDeclarationParser.roundBracesPair) as string;
		console.log(inputFieldArgumentsString);
		if (inputFieldArgumentsString) {
			inputFieldDeclaration.arguments = InputFieldDeclarationParser.parseArguments(inputFieldArgumentsString, inputFieldDeclaration.inputFieldType);
		} else {
			inputFieldDeclaration.arguments = [];
		}
		console.log(inputFieldDeclaration.arguments);

		return inputFieldDeclaration;
	}

	static parseArguments(inputFieldArgumentsString: string, inputFieldType: InputFieldType): InputFieldArgument[] {
		// console.log('inputFieldArgumentsString', inputFieldArgumentsString);
		let inputFieldArgumentStrings: string[] = ParserUtils.split(inputFieldArgumentsString, ',', InputFieldDeclarationParser.roundBracesPair);
		inputFieldArgumentStrings = inputFieldArgumentStrings.map(x => x.trim());

		const inputFieldArguments: InputFieldArgument[] = [];

		for (const inputFieldArgumentString of inputFieldArgumentStrings) {
			const inputFieldArgumentName: string = InputFieldDeclarationParser.extractInputFieldArgumentName(inputFieldArgumentString);
			console.log(inputFieldArgumentName);

			if (inputFieldArgumentName === 'class') {
				const inputFieldArgumentValue: string = InputFieldDeclarationParser.extractInputFieldArgumentValue(inputFieldArgumentString);

				let inputFieldClassArgument: InputFieldArgument = {name: inputFieldArgumentName, value: inputFieldArgumentValue};
				inputFieldArguments.push(inputFieldClassArgument);
			}

			if (inputFieldArgumentName === 'addLabels') {
				if (inputFieldType !== InputFieldType.SLIDER) {
					throw new MetaBindParsingError(`argument \'${inputFieldArgumentName}\' is only applicable to slider input fields`);
				}

				inputFieldArguments.push({name: 'labels', value: true});
			}

			if (inputFieldArgumentName === 'minValue') {
				if (inputFieldType !== InputFieldType.SLIDER) {
					throw new MetaBindParsingError(`argument \'${inputFieldArgumentName}\' is only applicable to slider input fields`);
				}

				const inputFieldArgumentValue: string = InputFieldDeclarationParser.extractInputFieldArgumentValue(inputFieldArgumentString);
				const inputFieldArgumentValueAsNumber: number = Number.parseInt(inputFieldArgumentValue);

				if (Number.isNaN(inputFieldArgumentValueAsNumber)) {
					throw new MetaBindParsingError(`argument \'${inputFieldArgumentName}\' value must be of type number`);
				}

				let inputFieldArgumentObject: InputFieldArgument = {name: inputFieldArgumentName, value: inputFieldArgumentValueAsNumber};
				inputFieldArguments.push(inputFieldArgumentObject);
			}

			if (inputFieldArgumentName === 'maxValue') {
				if (inputFieldType !== InputFieldType.SLIDER) {
					throw new MetaBindParsingError(`argument \'${inputFieldArgumentName}\' is only applicable to slider input fields`);
				}

				const inputFieldArgumentValue: string = InputFieldDeclarationParser.extractInputFieldArgumentValue(inputFieldArgumentString);
				const inputFieldArgumentValueAsNumber: number = Number.parseInt(inputFieldArgumentValue);

				if (Number.isNaN(inputFieldArgumentValueAsNumber)) {
					throw new MetaBindParsingError(`argument \'${inputFieldArgumentName}\' value must be of type number`);
				}

				let inputFieldArgumentObject: InputFieldArgument = {name: inputFieldArgumentName, value: inputFieldArgumentValueAsNumber};
				inputFieldArguments.push(inputFieldArgumentObject);
			}

			if (inputFieldArgumentName === 'option') {
				if (inputFieldType !== InputFieldType.SELECT && inputFieldType !== InputFieldType.MULTI_SELECT) {
					throw new MetaBindParsingError(`argument \'${inputFieldArgumentName}\' is only applicable to select and multi-select input fields`);
				}

				const inputFieldArgumentValue: string = InputFieldDeclarationParser.extractInputFieldArgumentValue(inputFieldArgumentString);

				let inputFieldArgumentObject: InputFieldArgument = {name: inputFieldArgumentName, value: inputFieldArgumentValue};
				inputFieldArguments.push(inputFieldArgumentObject);
			}

			if (inputFieldArgumentName === 'title') {
				if (inputFieldType !== InputFieldType.SELECT && inputFieldType !== InputFieldType.MULTI_SELECT) {
					throw new MetaBindParsingError(`argument \'${inputFieldArgumentName}\' is only applicable to select and multi-select input fields`);
				}

				const inputFieldArgumentValue: string = InputFieldDeclarationParser.extractInputFieldArgumentValue(inputFieldArgumentString);

				let inputFieldArgumentObject: InputFieldArgument = {name: inputFieldArgumentName, value: inputFieldArgumentValue};
				inputFieldArguments.push(inputFieldArgumentObject);
			}
		}

		return inputFieldArguments;
	}

	static extractInputFieldArgumentName(argumentString: string): string {
		return ParserUtils.removeInBetween(argumentString, InputFieldDeclarationParser.roundBracesPair);
	}

	static extractInputFieldArgumentValue(argumentString: string): string {
		let argumentName = this.extractInputFieldArgumentName(argumentString);

		let argumentValue = ParserUtils.getInBetween(argumentString, InputFieldDeclarationParser.roundBracesPair) as string;
		if (!argumentValue) {
			throw new MetaBindParsingError(`argument \'${argumentName}\' requires a non empty value`);
		}

		return argumentValue;
	}

}

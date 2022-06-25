import {InputFieldType} from '../inputFields/InputFieldFactory';
import {CharPair, ParserUtils} from '../utils/ParserUtils';

interface InputFieldDeclaration {
	fullDeclaration: string;
	declaration: string;
	inputFieldType: InputFieldType;
	isBound: boolean;
	bindTarget: string;

	arguments: InputFieldArgument[];
}

interface InputFieldArgument {
	name: string;
	value: any;
}

export class InputFieldDeclarationParser {
	static roundBracesPair: CharPair = new CharPair('(', ')');
	static squareBracesPair: CharPair = new CharPair('[', ']');
	static curlyBracesPair: CharPair = new CharPair('{', '}');
	static allBracesPairs: CharPair[] = [
		InputFieldDeclarationParser.roundBracesPair,
		InputFieldDeclarationParser.squareBracesPair,
		InputFieldDeclarationParser.curlyBracesPair,
	];


	static parse(fullDeclaration: string): InputFieldDeclaration {
		const inputFieldDeclaration: InputFieldDeclaration = {} as InputFieldDeclaration;

		inputFieldDeclaration.fullDeclaration = fullDeclaration;
		inputFieldDeclaration.declaration = InputFieldDeclarationParser.extractDeclaration(inputFieldDeclaration.fullDeclaration);

		const declarationParts: string[] = ParserUtils.split(inputFieldDeclaration.declaration, ':', InputFieldDeclarationParser.allBracesPairs);

		const bindTarget: string = declarationParts[1] ?? '';
		inputFieldDeclaration.isBound = !!bindTarget;

		const inputFieldTypeWithArguments: string = declarationParts[0];


		return inputFieldDeclaration;
	}

	static extractDeclaration(fullDeclaration: string): string {
		return ParserUtils.sliceInBetween(fullDeclaration, InputFieldDeclarationParser.squareBracesPair);
	}


}

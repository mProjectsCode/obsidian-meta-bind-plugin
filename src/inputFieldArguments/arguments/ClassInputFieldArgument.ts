import { AbstractInputFieldArgument } from '../AbstractInputFieldArgument';
import { InputFieldArgumentType, InputFieldType } from '../../parsers/InputFieldDeclarationParser';
import { ParsingResultNode } from '../../parsers/newInputFieldParser/InputFieldDeclarationValidator';

export class ClassInputFieldArgument extends AbstractInputFieldArgument {
	identifier: InputFieldArgumentType = InputFieldArgumentType.CLASS;
	allowedInputFields: InputFieldType[] = [];
	value: string[] = [];
	valueLengthMin: number = 1;
	valueLengthMax: number = 1;
	allowMultiple: boolean = true;

	_parseValue(value: ParsingResultNode[]): void {
		this.value = value[0].value.split(' ');
	}
}

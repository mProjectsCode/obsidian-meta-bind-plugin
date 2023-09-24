import { AbstractInputFieldArgument } from '../AbstractInputFieldArgument';
import { InputFieldArgumentType, InputFieldType } from '../../parsers/InputFieldDeclarationParser';
import { ParsingResultNode } from '../../parsers/newInputFieldParser/InputFieldDeclarationValidator';

export class TitleInputFieldArgument extends AbstractInputFieldArgument {
	identifier: InputFieldArgumentType = InputFieldArgumentType.TITLE;
	allowedInputFields: InputFieldType[] = [];
	value: string = '';
	valueLengthMin: number = 1;
	valueLengthMax: number = 1;
	allowMultiple: boolean = false;

	_parseValue(value: ParsingResultNode[]): void {
		this.value = value[0].value;
	}
}

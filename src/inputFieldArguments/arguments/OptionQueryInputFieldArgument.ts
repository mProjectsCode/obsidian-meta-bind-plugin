import { AbstractInputFieldArgument } from '../AbstractInputFieldArgument';
import { InputFieldArgumentType, InputFieldType } from '../../parsers/InputFieldDeclarationParser';
import { ParsingResultNode } from '../../parsers/newInputFieldParser/InputFieldDeclarationValidator';

export class OptionQueryInputFieldArgument extends AbstractInputFieldArgument {
	identifier: InputFieldArgumentType = InputFieldArgumentType.OPTION_QUERY;
	allowedInputFields: InputFieldType[] = [InputFieldType.SUGGESTER, InputFieldType.IMAGE_SUGGESTER];
	value: string = '';
	valueLengthMin: number = 1;
	valueLengthMax: number = 1;
	allowMultiple: boolean = true;

	_parseValue(value: ParsingResultNode[]): void {
		this.value = value[0].value;
	}
}

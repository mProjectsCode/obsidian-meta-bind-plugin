import { AbstractInputFieldArgument } from '../AbstractInputFieldArgument';
import { InputFieldArgumentType, InputFieldType } from '../../parsers/InputFieldDeclarationParser';
import { MBLiteral, parseLiteral } from '../../utils/Utils';
import { ParsingResultNode } from '../../parsers/newInputFieldParser/InputFieldDeclarationValidator';

export class OffValueInputFieldArgument extends AbstractInputFieldArgument {
	identifier: InputFieldArgumentType = InputFieldArgumentType.OFF_VALUE;
	allowedInputFields: InputFieldType[] = [InputFieldType.TOGGLE];
	value: MBLiteral = false;
	valueLengthMin: number = 1;
	valueLengthMax: number = 1;
	allowMultiple: boolean = false;

	_parseValue(value: ParsingResultNode[]): void {
		this.value = parseLiteral(value[0].value);
	}
}

import { AbstractInputFieldArgument } from '../AbstractInputFieldArgument';
import { InputFieldArgumentType, InputFieldType } from '../../parsers/InputFieldDeclarationParser';
import { ParsingResultNode } from '../../parsers/newInputFieldParser/InputFieldDeclarationValidator';

export class PlaceholderInputFieldArgument extends AbstractInputFieldArgument {
	identifier: InputFieldArgumentType = InputFieldArgumentType.PLACEHOLDER;
	allowedInputFields: InputFieldType[] = [
		InputFieldType.TEXT,
		InputFieldType.TEXT_AREA,
		InputFieldType.TEXT_AREA_DEPRECATED,
		InputFieldType.NUMBER,
		InputFieldType.LIST,
	];
	value: string = '';
	valueLengthMin: number = 1;
	valueLengthMax: number = 1;
	allowMultiple: boolean = true;

	_parseValue(value: ParsingResultNode[]): void {
		this.value = value[0].value;
	}
}

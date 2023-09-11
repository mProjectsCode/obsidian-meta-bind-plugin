import { AbstractInputFieldArgument } from '../AbstractInputFieldArgument';
import { InputFieldArgumentType, InputFieldType } from '../../parsers/InputFieldDeclarationParser';
import { ErrorLevel, MetaBindArgumentError } from '../../utils/errors/MetaBindErrors';
import { MBLiteral, parseLiteral } from '../../utils/Utils';
import { ParsingResultNode } from '../../parsers/newInputFieldParser/InputFieldDeclarationValidator';

export class OptionInputFieldArgument extends AbstractInputFieldArgument {
	identifier: InputFieldArgumentType = InputFieldArgumentType.OPTION;
	allowedInputFields: InputFieldType[] = [
		InputFieldType.SELECT,
		InputFieldType.MULTI_SELECT,
		InputFieldType.SUGGESTER,
		InputFieldType.IMAGE_SUGGESTER,
		InputFieldType.INLINE_SELECT,
	];
	value: MBLiteral = '';
	name: string = '';
	valueLengthMin: number = 1;
	valueLengthMax: number = 2;
	allowMultiple: boolean = true;

	_parseValue(value: ParsingResultNode[]): void {
		if (value.length === 1) {
			this.value = parseLiteral(value[0].value);
			this.name = value[0].value;
		} else if (value.length === 2) {
			this.value = parseLiteral(value[0].value);
			this.name = value[1].value;
		}
	}
}

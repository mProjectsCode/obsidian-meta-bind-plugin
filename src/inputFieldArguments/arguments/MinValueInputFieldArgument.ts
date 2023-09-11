import { AbstractInputFieldArgument } from '../AbstractInputFieldArgument';
import { InputFieldArgumentType, InputFieldType } from '../../parsers/InputFieldDeclarationParser';
import { ErrorLevel, MetaBindParsingError } from '../../utils/errors/MetaBindErrors';
import { ParsingResultNode } from '../../parsers/newInputFieldParser/InputFieldDeclarationValidator';

export class MinValueInputFieldArgument extends AbstractInputFieldArgument {
	identifier: InputFieldArgumentType = InputFieldArgumentType.MIN_VALUE;
	allowedInputFields: InputFieldType[] = [InputFieldType.SLIDER, InputFieldType.PROGRESS_BAR];
	value: number = 0;
	valueLengthMin: number = 1;
	valueLengthMax: number = 1;
	allowMultiple: boolean = false;

	_parseValue(value: ParsingResultNode[]): void {
		this.value = Number.parseInt(value[0].value);
		if (Number.isNaN(this.value)) {
			throw new MetaBindParsingError(
				ErrorLevel.ERROR,
				'failed to set value for input field argument',
				"value of argument 'minValue' must be of type number"
			);
		}
	}
}

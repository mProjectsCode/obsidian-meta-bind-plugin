import { AbstractInputFieldArgument } from '../AbstractInputFieldArgument';
import { InputFieldArgumentType, InputFieldType } from '../../parsers/InputFieldDeclarationParser';
import { ParsingResultNode } from '../../parsers/newInputFieldParser/InputFieldDeclarationValidator';

export class AddLabelsInputFieldArgument extends AbstractInputFieldArgument {
	identifier: InputFieldArgumentType = InputFieldArgumentType.ADD_LABELS;
	allowedInputFields: InputFieldType[] = [InputFieldType.SLIDER, InputFieldType.PROGRESS_BAR];
	value: boolean = true;
	valueLengthMin: number = 0;
	valueLengthMax: number = 1;
	allowMultiple: boolean = false;

	override _parseValue(value: ParsingResultNode[]): void {
		this.value = value[0] === undefined || value[0]?.value.toLowerCase() === 'true';
	}
}

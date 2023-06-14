import { AbstractInputFieldArgument } from '../AbstractInputFieldArgument';
import { InputFieldArgumentType, InputFieldType } from '../../parsers/InputFieldDeclarationParser';

export class AddLabelsInputFieldArgument extends AbstractInputFieldArgument {
	identifier: InputFieldArgumentType = InputFieldArgumentType.ADD_LABELS;
	allowedInputFields: InputFieldType[] = [InputFieldType.SLIDER, InputFieldType.PROGRESS_BAR];
	value: boolean = true;
	requiresValue: boolean = false;
	allowMultiple: boolean = false;

	override parseValue(value: any): void {
		if (typeof value === 'boolean') {
			this.value = value;
		} else if (typeof value === 'string') {
			this.value = value.toLowerCase() === 'true';
		}
	}
}

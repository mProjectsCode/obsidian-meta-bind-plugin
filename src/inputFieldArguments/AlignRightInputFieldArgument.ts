import {AbstractInputFieldArgument} from './AbstractInputFieldArgument';
import {InputFieldArgumentType, InputFieldType} from '../parsers/InputFieldDeclarationParser';

export class AlignRightInputFieldArgument extends AbstractInputFieldArgument {
	identifier: InputFieldArgumentType = InputFieldArgumentType.ALIGN_RIGHT;
	allowedInputFields: InputFieldType[] = [
		InputFieldType.DATE_PICKER,
	];
	value: boolean = true;
	requiresValue: boolean = false;
	allowMultiple: boolean = false;

	parseValue(valueStr: string): void {
		this.value = (valueStr.toLowerCase() === 'true');
	}
}

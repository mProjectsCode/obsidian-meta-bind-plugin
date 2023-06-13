import { AbstractInputFieldArgument } from '../AbstractInputFieldArgument';
import { InputFieldArgumentType, InputFieldType } from '../../parsers/InputFieldDeclarationParser';

export class OptionInputFieldArgument extends AbstractInputFieldArgument {
	identifier: InputFieldArgumentType = InputFieldArgumentType.OPTION;
	allowedInputFields: InputFieldType[] = [
		InputFieldType.SELECT,
		InputFieldType.MULTI_SELECT,
		InputFieldType.SUGGESTER,
		InputFieldType.IMAGE_SUGGESTER,
		InputFieldType.INLINE_SELECT,
	];
	value: string = '';
	requiresValue: boolean = true;
	allowMultiple: boolean = true;

	parseValue(valueStr: string): void {
		this.value = valueStr;
	}
}

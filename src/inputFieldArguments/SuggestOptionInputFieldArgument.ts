import { AbstractInputFieldArgument } from './AbstractInputFieldArgument';
import { InputFieldArgumentType, InputFieldType } from '../parsers/InputFieldDeclarationParser';

export class SuggestOptionInputFieldArgument extends AbstractInputFieldArgument {
	identifier: InputFieldArgumentType = InputFieldArgumentType.SUGGEST_OPTION;
	allowedInputFields: InputFieldType[] = [InputFieldType.SUGGESTER];
	value: string = '';
	requiresValue: boolean = true;
	allowMultiple: boolean = true;

	parseValue(valueStr: string): void {
		this.value = valueStr;
	}
}

import { AbstractInputFieldArgument } from './AbstractInputFieldArgument';
import { InputFieldArgumentType, InputFieldType } from '../parsers/InputFieldDeclarationParser';

export class SuggestOptionQueryInputFieldArgument extends AbstractInputFieldArgument {
	identifier: InputFieldArgumentType = InputFieldArgumentType.SUGGEST_OPTION_QUERY;
	allowedInputFields: InputFieldType[] = [InputFieldType.SUGGESTER];
	value: string = '';
	requiresValue: boolean = true;
	allowMultiple: boolean = true;

	parseValue(valueStr: string): void {
		this.value = valueStr;
	}
}

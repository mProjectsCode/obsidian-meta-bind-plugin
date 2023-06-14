import { AbstractInputFieldArgument } from '../AbstractInputFieldArgument';
import { InputFieldArgumentType, InputFieldType } from '../../parsers/InputFieldDeclarationParser';

export class OptionQueryInputFieldArgument extends AbstractInputFieldArgument {
	identifier: InputFieldArgumentType = InputFieldArgumentType.OPTION_QUERY;
	allowedInputFields: InputFieldType[] = [InputFieldType.SUGGESTER, InputFieldType.IMAGE_SUGGESTER];
	value: string = '';
	requiresValue: boolean = true;
	allowMultiple: boolean = true;

	parseValue(valueStr: string): void {
		this.value = valueStr;
	}
}

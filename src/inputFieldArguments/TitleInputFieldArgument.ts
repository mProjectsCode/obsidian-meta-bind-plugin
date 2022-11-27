import { AbstractInputFieldArgument } from './AbstractInputFieldArgument';
import { InputFieldArgumentType, InputFieldType } from '../parsers/InputFieldDeclarationParser';

export class TitleInputFieldArgument extends AbstractInputFieldArgument {
	identifier: InputFieldArgumentType = InputFieldArgumentType.TITLE;
	allowedInputFields: InputFieldType[] = [InputFieldType.SELECT, InputFieldType.MULTI_SELECT];
	value: string = '';
	requiresValue: boolean = true;
	allowMultiple: boolean = false;

	parseValue(valueStr: string): void {
		this.value = valueStr;
	}
}

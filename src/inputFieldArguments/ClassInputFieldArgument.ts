import { AbstractInputFieldArgument } from './AbstractInputFieldArgument';
import { InputFieldArgumentType, InputFieldType } from '../parsers/InputFieldDeclarationParser';

export class ClassInputFieldArgument extends AbstractInputFieldArgument {
	identifier: InputFieldArgumentType = InputFieldArgumentType.CLASS;
	allowedInputFields: InputFieldType[] = [];
	value: string[] = [];
	requiresValue: boolean = true;
	allowMultiple: boolean = true;

	parseValue(valueStr: string): void {
		this.value = valueStr.split(' ');
	}
}

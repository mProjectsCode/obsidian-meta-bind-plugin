import { AbstractInputFieldArgument } from '../AbstractInputFieldArgument';
import { InputFieldArgumentType, InputFieldType } from '../../parsers/InputFieldDeclarationParser';

export class ShowcaseInputFieldArgument extends AbstractInputFieldArgument {
	identifier: InputFieldArgumentType = InputFieldArgumentType.SHOWCASE;
	allowedInputFields: InputFieldType[] = [];
	value: boolean = true;
	requiresValue: boolean = false;
	allowMultiple: boolean = false;

	parseValue(valueStr: string): void {
		this.value = valueStr.toLowerCase() === 'true';
	}
}

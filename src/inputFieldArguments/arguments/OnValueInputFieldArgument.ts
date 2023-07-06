import { AbstractInputFieldArgument } from '../AbstractInputFieldArgument';
import { InputFieldArgumentType, InputFieldType } from '../../parsers/InputFieldDeclarationParser';
import { MBLiteral, parseLiteral } from '../../utils/Utils';

export class OnValueInputFieldArgument extends AbstractInputFieldArgument {
	identifier: InputFieldArgumentType = InputFieldArgumentType.ON_VALUE;
	allowedInputFields: InputFieldType[] = [InputFieldType.TOGGLE];
	value: MBLiteral = true;
	requiresValue: boolean = true;
	allowMultiple: boolean = false;

	parseValue(valueStr: string): void {
		this.value = parseLiteral(valueStr);
	}
}

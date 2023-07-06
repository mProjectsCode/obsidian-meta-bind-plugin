import { AbstractInputFieldArgument } from '../AbstractInputFieldArgument';
import { InputFieldArgumentType, InputFieldType } from '../../parsers/InputFieldDeclarationParser';
import { MBLiteral, parseLiteral } from '../../utils/Utils';

export class OffValueInputFieldArgument extends AbstractInputFieldArgument {
	identifier: InputFieldArgumentType = InputFieldArgumentType.OFF_VALUE;
	allowedInputFields: InputFieldType[] = [InputFieldType.TOGGLE];
	value: MBLiteral = false;
	requiresValue: boolean = true;
	allowMultiple: boolean = false;

	parseValue(valueStr: string): void {
		this.value = parseLiteral(valueStr);
	}
}

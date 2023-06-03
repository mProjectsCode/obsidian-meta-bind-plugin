import { AbstractInputFieldArgument } from '../AbstractInputFieldArgument';
import { InputFieldArgumentType, InputFieldType } from '../../parsers/InputFieldDeclarationParser';

export class OffValueInputFieldArgument extends AbstractInputFieldArgument {
	identifier: InputFieldArgumentType = InputFieldArgumentType.OFF_VALUE;
	allowedInputFields: InputFieldType[] = [InputFieldType.TOGGLE];
	value: string | number | boolean = false;
	requiresValue: boolean = true;
	allowMultiple: boolean = false;

	parseValue(valueStr: string): void {
		if (valueStr === 'true') {
			this.value = true;
		} else if (valueStr === 'false') {
			this.value = false;
		} else {
			const parsedNumber = Number.parseFloat(valueStr);
			this.value = !Number.isNaN(parsedNumber) ? parsedNumber : valueStr;
		}
	}
}

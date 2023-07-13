import { AbstractInputFieldArgument } from '../AbstractInputFieldArgument';
import { InputFieldArgumentType, InputFieldType } from '../../parsers/InputFieldDeclarationParser';
import { MBExtendedLiteral, parseLiteral } from '../../utils/Utils';

export class DefaultValueInputFieldArgument extends AbstractInputFieldArgument {
	identifier: InputFieldArgumentType = InputFieldArgumentType.DEFAULT_VALUE;
	allowedInputFields: InputFieldType[] = [];
	value: MBExtendedLiteral = '';
	requiresValue: boolean = true;
	allowMultiple: boolean = false;

	parseValue(valueStr: string): void {
		this.value = parseLiteral(valueStr);
	}
}

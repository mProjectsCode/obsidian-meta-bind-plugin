import { AbstractInputFieldArgument } from './AbstractInputFieldArgument';
import { InputFieldArgumentType, InputFieldType } from '../parsers/InputFieldDeclarationParser';
import { MetaBindParsingError } from '../utils/Utils';

export class MinValueInputFieldArgument extends AbstractInputFieldArgument {
	identifier: InputFieldArgumentType = InputFieldArgumentType.MIN_VALUE;
	allowedInputFields: InputFieldType[] = [InputFieldType.SLIDER];
	value: number = 0;
	requiresValue: boolean = true;
	allowMultiple: boolean = false;

	parseValue(valueStr: string): void {
		this.value = Number.parseInt(valueStr);
		if (Number.isNaN(this.value)) {
			throw new MetaBindParsingError("value of argument 'minValue' must be of type number");
		}
	}
}

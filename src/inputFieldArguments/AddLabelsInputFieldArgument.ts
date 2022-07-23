import {AbstractInputFieldArgument} from "./AbstractInputFieldArgument";
import {InputFieldArgumentType, InputFieldType} from "../parsers/InputFieldDeclarationParser";

export class AddLabelsInputFieldArgument extends AbstractInputFieldArgument {
	identifier: InputFieldArgumentType = InputFieldArgumentType.ADD_LABELS;
	allowedInputFields: InputFieldType[] = [
		InputFieldType.SLIDER,
	];
	value: boolean = true;
	requiresValue: boolean = false;
	allowMultiple: boolean = false;

	parseValue(valueStr: string): void {
		this.value = (valueStr.toLowerCase() === 'true');
	}

}

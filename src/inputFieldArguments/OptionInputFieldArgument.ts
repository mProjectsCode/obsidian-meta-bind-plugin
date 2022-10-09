import {AbstractInputFieldArgument} from "./AbstractInputFieldArgument";
import {InputFieldArgumentType, InputFieldType} from "../parsers/InputFieldDeclarationParser";
import {MetaBindParsingError} from "../utils/Utils";

export class OptionInputFieldArgument extends AbstractInputFieldArgument {
	identifier: InputFieldArgumentType = InputFieldArgumentType.OPTION;
	allowedInputFields: InputFieldType[] = [
		InputFieldType.SELECT,
		InputFieldType.MULTI_SELECT,
	];
	value: string = '';
	requiresValue: boolean = true;
	allowMultiple: boolean = true;

	parseValue(valueStr: string): void {
		this.value = valueStr;
	}

}

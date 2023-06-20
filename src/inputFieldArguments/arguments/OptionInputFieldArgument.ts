import { AbstractInputFieldArgument } from '../AbstractInputFieldArgument';
import { InputFieldArgumentType, InputFieldType } from '../../parsers/InputFieldDeclarationParser';
import { ErrorLevel, MetaBindArgumentError } from '../../utils/errors/MetaBindErrors';

export class OptionInputFieldArgument extends AbstractInputFieldArgument {
	identifier: InputFieldArgumentType = InputFieldArgumentType.OPTION;
	allowedInputFields: InputFieldType[] = [
		InputFieldType.SELECT,
		InputFieldType.MULTI_SELECT,
		InputFieldType.SUGGESTER,
		InputFieldType.IMAGE_SUGGESTER,
		InputFieldType.INLINE_SELECT,
	];
	value: string = '';
	name: string = '';
	requiresValue: boolean = true;
	allowMultiple: boolean = true;

	parseValue(valueStr: string): void {
		const valueParts: string[] = valueStr.split(',').map(x => x.trim());

		if (valueParts.length === 1) {
			this.value = valueParts[0];
			this.name = valueParts[0];
		} else if (valueParts.length === 2) {
			this.value = valueParts[0];
			this.name = valueParts[1];
		} else {
			throw new MetaBindArgumentError(ErrorLevel.WARNING, 'failed to parse option argument value', 'expected there to be either one or two comma seperated values');
		}
	}
}

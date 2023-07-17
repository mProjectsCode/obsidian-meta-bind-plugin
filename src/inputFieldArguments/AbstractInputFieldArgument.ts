import { InputFieldArgumentType, InputFieldType } from '../parsers/InputFieldDeclarationParser';

export abstract class AbstractInputFieldArgument {
	identifier: InputFieldArgumentType = InputFieldArgumentType.INVALID;
	allowedInputFields: InputFieldType[] = [];
	value: any;
	requiresValue: boolean = false;
	allowMultiple: boolean = false;

	abstract parseValue(value: string): void;

	isAllowed(inputFieldType: InputFieldType): boolean {
		if (this.allowedInputFields.length === 0) {
			return true;
		}

		return this.allowedInputFields.contains(inputFieldType);
	}

	getAllowedInputFieldsAsString(): string {
		return this.allowedInputFields.length === 0 ? 'all' : this.allowedInputFields.join(', ');
	}
}
